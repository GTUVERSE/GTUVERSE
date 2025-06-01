using System.Collections;
using UnityEngine;
using System.IO;
using System.IO.Compression;
using NativeWebSocket;
using System;
using System.Text;
using System.Net;
using System.Threading;
#if UNITY_EDITOR
using UnityEditor;
#endif

public class BitmapStreamer : MonoBehaviour
{
    [Header("🎥 Stream Settings")]
    public Camera streamCamera;
    public int streamWidth = 1280;
    public int streamHeight = 720;
    public int targetFPS = 45;
    
    [Header("📡 Connection")]
    public string websocketURL = "ws://localhost:52780";
    public bool autoConnect = true;
    
    [Header("🌐 HTTP Server")]
    public bool enableHTTPServer = true;
    public int httpPort = 52781;
    
    [Header("🗜 Quality")]
    [Range(40, 90)]
    public int jpegQuality = 70;
    public bool useGZipCompression = false;
    
    [Header("📊 Debug")]
    public bool showDebugInfo = true;
    
    // WebSocket Status
    private WebSocket ws;
    private bool isConnected = false;
    private bool isStreaming = false;
    private bool isRegistered = false;
    private string clientId = "";
    
    // HTTP Server
    private HttpListener httpListener;
    private Thread httpListenerThread;
    private bool httpServerRunning = false;
    
    // Performance optimized rendering
    private RenderTexture renderTexture;
    private Texture2D captureTexture;
    private float frameInterval;
    private float lastFrameTime;
    
    // Latest frame for HTTP serving
    private byte[] latestFrameData;
    private float lastFrameTimestamp;
    private readonly object frameLock = new object();
    
    // Tracking
    private int currentFrameNumber = 0;
    private int connectedViewers = 0;
    private int httpRequests = 0;
    private float currentFPS = 0f;
    
    // FPS calculation
    private int frameCount = 0;
    private float fpsTimer = 0f;
    
    // Performance flags
    private bool processingFrame = false;
    
    void Start()
    {
        frameInterval = 1f / targetFPS;
        SetupRenderTexture();
        
        if (enableHTTPServer)
        {
            StartHTTPServer();
        }
        
        if (autoConnect)
        {
            ConnectToServer();
        }
    }
    
    void Update()
    {
        if (ws != null)
        {
            ws.DispatchMessageQueue();
        }
        
        UpdateFPSCalculation();
        
        // Only stream if registered and not processing
        if (isConnected && isRegistered && isStreaming && !processingFrame && 
            Time.time - lastFrameTime >= frameInterval)
        {
            StartCoroutine(CaptureAndSendFrame());
            lastFrameTime = Time.time;
        }
    }
    
    void SetupRenderTexture()
    {
        if (streamCamera == null)
        {
            streamCamera = Camera.main;
            if (streamCamera == null)
            {
                Debug.LogError("No camera assigned for streaming!");
                return;
            }
        }
        
        renderTexture = new RenderTexture(streamWidth, streamHeight, 24);
        renderTexture.Create();
        captureTexture = new Texture2D(streamWidth, streamHeight, TextureFormat.RGB24, false);
    }
    
    #region HTTP Server
    
    void StartHTTPServer()
    {
        try
        {
            httpListener = new HttpListener();
            httpListener.Prefixes.Add($"http://localhost:{httpPort}/");
            httpListener.Start();
            httpServerRunning = true;
            
            httpListenerThread = new Thread(HTTPServerThread);
            httpListenerThread.Start();
            
            Debug.Log($"🌐 HTTP Server started on http://localhost:{httpPort}");
        }
        catch (Exception e)
        {
            Debug.LogError($"❌ Failed to start HTTP server: {e.Message}");
        }
    }
    
    void HTTPServerThread()
    {
        while (httpServerRunning && httpListener != null)
        {
            try
            {
                HttpListenerContext context = httpListener.GetContext();
                ThreadPool.QueueUserWorkItem(ProcessHTTPRequest, context);
            }
            catch (Exception e)
            {
                if (httpServerRunning)
                {
                    Debug.LogError($"❌ HTTP Server error: {e.Message}");
                }
            }
        }
    }
    
    void ProcessHTTPRequest(object contextObj)
    {
        HttpListenerContext context = (HttpListenerContext)contextObj;
        HttpListenerRequest request = context.Request;
        HttpListenerResponse response = context.Response;
        
        try
        {
            // CORS Headers
            response.Headers.Add("Access-Control-Allow-Origin", "*");
            response.Headers.Add("Access-Control-Allow-Methods", "GET, OPTIONS");
            response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
            response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
            response.Headers.Add("Pragma", "no-cache");
            response.Headers.Add("Expires", "0");
            
            if (request.HttpMethod == "OPTIONS")
            {
                // CORS Preflight
                response.StatusCode = 200;
                response.Close();
                return;
            }
            
            if (request.HttpMethod == "GET")
            {
                string path = request.Url.AbsolutePath;
                
                if (path == "/" || path == "/stream")
                {
                    // Serve latest frame
                    ServeLatestFrame(response);
                }
                else if (path == "/status")
                {
                    // Serve status JSON
                    ServeStatus(response);
                }
                else
                {
                    // 404 Not Found
                    response.StatusCode = 404;
                    byte[] notFound = Encoding.UTF8.GetBytes("Not Found");
                    response.ContentLength64 = notFound.Length;
                    response.OutputStream.Write(notFound, 0, notFound.Length);
                }
            }
            
            httpRequests++;
        }
        catch (Exception e)
        {
            Debug.LogError($"❌ HTTP Request error: {e.Message}");
            try
            {
                response.StatusCode = 500;
                byte[] error = Encoding.UTF8.GetBytes($"Server Error: {e.Message}");
                response.ContentLength64 = error.Length;
                response.OutputStream.Write(error, 0, error.Length);
            }
            catch { }
        }
        finally
        {
            try
            {
                response.Close();
            }
            catch { }
        }
    }
    
    void ServeLatestFrame(HttpListenerResponse response)
    {
        lock (frameLock)
        {
            if (latestFrameData != null && Time.time - lastFrameTimestamp < 5f)
            {
                // Serve fresh frame
                response.ContentType = "image/jpeg";
                response.StatusCode = 200;
                response.ContentLength64 = latestFrameData.Length;
                response.OutputStream.Write(latestFrameData, 0, latestFrameData.Length);
                
                if (showDebugInfo && httpRequests % 30 == 0)
                {
                    Debug.Log($"📤 HTTP: Served frame #{currentFrameNumber} ({latestFrameData.Length} bytes)");
                }
            }
            else
            {
                // No frame available
                response.StatusCode = 503;
                response.ContentType = "text/plain";
                byte[] message = Encoding.UTF8.GetBytes("Stream not available - Unity not streaming");
                response.ContentLength64 = message.Length;
                response.OutputStream.Write(message, 0, message.Length);
            }
        }
    }
    
    void ServeStatus(HttpListenerResponse response)
    {
        var status = new
        {
            status = (latestFrameData != null && Time.time - lastFrameTimestamp < 5f) ? "online" : "offline",
            unity_connected = isConnected,
            streaming = isStreaming,
            last_frame = lastFrameTimestamp,
            frame_age = Time.time - lastFrameTimestamp,
            frame_number = currentFrameNumber,
            fps = currentFPS,
            http_requests = httpRequests,
            resolution = $"{streamWidth}x{streamHeight}",
            quality = jpegQuality
        };
        
        string json = JsonUtility.ToJson(status);
        response.ContentType = "application/json";
        response.StatusCode = 200;
        byte[] jsonBytes = Encoding.UTF8.GetBytes(json);
        response.ContentLength64 = jsonBytes.Length;
        response.OutputStream.Write(jsonBytes, 0, jsonBytes.Length);
    }
    
    void StopHTTPServer()
    {
        httpServerRunning = false;
        
        if (httpListener != null)
        {
            try
            {
                httpListener.Stop();
                httpListener.Close();
            }
            catch (Exception e)
            {
                Debug.LogError($"❌ Error stopping HTTP server: {e.Message}");
            }
            httpListener = null;
        }
        
        if (httpListenerThread != null)
        {
            try
            {
                httpListenerThread.Join(1000); // Wait max 1 second
            }
            catch { }
            httpListenerThread = null;
        }
    }
    
    #endregion
    
    #region WebSocket (existing code)
    
    async void ConnectToServer()
    {
        try
        {
            ws = new WebSocket(websocketURL);
            
            ws.OnOpen += OnWebSocketOpen;
            ws.OnClose += OnWebSocketClose;
            ws.OnMessage += OnWebSocketMessage;
            ws.OnError += OnWebSocketError;
            
            await ws.Connect();
        }
        catch (Exception e)
        {
            Debug.LogError($"Failed to connect to WebSocket: {e.Message}");
        }
    }
    
    void OnWebSocketOpen()
    {
        isConnected = true;
        Debug.Log("Connected to bitmap server");
        
        string json = $"{{\"type\":\"unity_bitmap_streamer\", \"version\":\"1.0\", \"capabilities\":{{\"resolution\":\"{streamWidth}x{streamHeight}\", \"fps\":{targetFPS}, \"compression\":\"{(useGZipCompression ? "gzip" : "none")}\"}}}}";
        ws.SendText(json);
        
        Debug.Log($"Sent registration: {json}");
    }
    
    void OnWebSocketClose(WebSocketCloseCode closeCode)
    {
        isConnected = false;
        isStreaming = false;
        isRegistered = false;
        Debug.Log($"Disconnected from server: {closeCode}");
    }
    
    void OnWebSocketMessage(byte[] data)
    {
        string message = System.Text.Encoding.UTF8.GetString(data);
        
        if (showDebugInfo)
        {
            Debug.Log($"Received: {message}");
        }
        
        try
        {
            var response = JsonUtility.FromJson<ServerResponse>(message);
            
            if (response.type == "registration_confirmed")
            {
                isRegistered = true;
                isStreaming = true;
                clientId = response.client_id;
                connectedViewers = response.web_clients_count;
                
                Debug.Log($"✅ Registered as {clientId}, {connectedViewers} viewers connected");
            }
            else if (response.type == "client_count")
            {
                connectedViewers = response.count;
                if (showDebugInfo)
                {
                    Debug.Log($"👥 Viewers: {connectedViewers}");
                }
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"Failed to parse server message: {e.Message}");
        }
    }
    
    void OnWebSocketError(string error)
    {
        Debug.LogError($"WebSocket error: {error}");
    }
    
    IEnumerator CaptureAndSendFrame()
    {
        if (processingFrame) yield break;
        
        processingFrame = true;
        
        // Capture frame data
        byte[] imageData = null;
        string headerJson = null;
        bool captureSuccessful = false;
        
        // Render camera to texture
        RenderTexture previousRT = RenderTexture.active;
        streamCamera.targetTexture = renderTexture;
        streamCamera.Render();
        
        // Read pixels
        RenderTexture.active = renderTexture;
        captureTexture.ReadPixels(new Rect(0, 0, streamWidth, streamHeight), 0, 0);
        captureTexture.Apply();
        
        // Restore render target
        streamCamera.targetTexture = null;
        RenderTexture.active = previousRT;
        
        // Encode to JPEG
        if (captureTexture != null)
        {
            imageData = captureTexture.EncodeToJPG(jpegQuality);
            
            if (imageData != null)
            {
                // Compress if enabled
                if (useGZipCompression)
                {
                    imageData = CompressData(imageData);
                }
                
                // Store for HTTP serving
                lock (frameLock)
                {
                    latestFrameData = imageData;
                    lastFrameTimestamp = Time.time;
                }
                
                headerJson = $"{{\"type\":\"bitmap_frame\", \"frame_number\":{currentFrameNumber}, \"timestamp\":{Time.time}, \"resolution\":\"{streamWidth}x{streamHeight}\", \"compression\":\"{(useGZipCompression ? "gzip" : "none")}\", \"size\":{imageData.Length}}}";
                
                captureSuccessful = true;
            }
        }
        
        // Send WebSocket data if connected
        if (captureSuccessful && ws != null && isConnected && isRegistered && imageData != null)
        {
            _ = ws.SendText(headerJson);
            yield return new WaitForEndOfFrame();
            _ = ws.Send(imageData);
            
            currentFrameNumber++;
            
            if (showDebugInfo && currentFrameNumber % 30 == 0)
            {
                Debug.Log($"📸 Sent frame {currentFrameNumber} ({imageData.Length} bytes) | HTTP requests: {httpRequests}");
            }
        }
        
        processingFrame = false;
        yield return null;
    }
    
    #endregion
    
    byte[] CompressData(byte[] data)
    {
        using (var memoryStream = new MemoryStream())
        {
            using (var gzipStream = new GZipStream(memoryStream, CompressionMode.Compress))
            {
                gzipStream.Write(data, 0, data.Length);
            }
            return memoryStream.ToArray();
        }
    }
    
    void UpdateFPSCalculation()
    {
        frameCount++;
        fpsTimer += Time.deltaTime;
        
        if (fpsTimer >= 1f)
        {
            currentFPS = frameCount / fpsTimer;
            frameCount = 0;
            fpsTimer = 0f;
        }
    }
    
    void OnGUI()
    {
        if (!showDebugInfo) return;
        
        GUILayout.BeginArea(new Rect(10, 10, 400, 300));
        
        // WebSocket Status
        GUILayout.Label($"🔗 WebSocket: {(isConnected ? "Connected" : "Disconnected")}");
        GUILayout.Label($"📝 Registered: {isRegistered} (ID: {clientId})");
        GUILayout.Label($"🎥 Streaming: {isStreaming}");
        
        // HTTP Server Status
        GUILayout.Label($"🌐 HTTP Server: {(httpServerRunning ? "Running" : "Stopped")}");
        GUILayout.Label($"📊 HTTP Requests: {httpRequests}");
        GUILayout.Label($"🔗 HTTP URL: http://localhost:{httpPort}");
        
        // Performance
        GUILayout.Label($"📊 FPS: {currentFPS:F1}");
        GUILayout.Label($"🖼 Frame: {currentFrameNumber}");
        GUILayout.Label($"👥 Viewers: {connectedViewers}");
        GUILayout.Label($"🎯 Resolution: {streamWidth}x{streamHeight}");
        GUILayout.Label($"⚙️ Quality: {jpegQuality}%");
        GUILayout.Label($"🗜 Compression: {(useGZipCompression ? "GZip" : "None")}");
        
        if (GUILayout.Button(isConnected ? "Disconnect WS" : "Connect WS"))
        {
            if (isConnected)
            {
                DisconnectFromServer();
            }
            else
            {
                ConnectToServer();
            }
        }
        
        if (GUILayout.Button(httpServerRunning ? "Stop HTTP" : "Start HTTP"))
        {
            if (httpServerRunning)
            {
                StopHTTPServer();
            }
            else
            {
                StartHTTPServer();
            }
        }
        
        GUILayout.EndArea();
    }
    
    async void DisconnectFromServer()
    {
        if (ws != null)
        {
            await ws.Close();
            ws = null;
        }
        
        isConnected = false;
        isStreaming = false;
        isRegistered = false;
    }
    
    void OnDestroy()
    {
        StopHTTPServer();
        
        if (ws != null)
        {
            _ = ws.Close();
        }
        
        if (renderTexture != null)
        {
            renderTexture.Release();
        }
        
        if (captureTexture != null)
        {
            DestroyImmediate(captureTexture);
        }
    }
    
    // Public methods
    public void StartStreaming()
    {
        if (isConnected && isRegistered)
        {
            isStreaming = true;
        }
    }
    
    public void StopStreaming()
    {
        isStreaming = false;
    }
    
    public void SetQuality(int quality)
    {
        jpegQuality = Mathf.Clamp(quality, 10, 100);
    }
    
    public void SetResolution(int width, int height)
    {
        streamWidth = width;
        streamHeight = height;
        SetupRenderTexture();
    }
}

[System.Serializable]
public class ServerResponse
{
    public string type;
    public string client_id;
    public int web_clients_count;
    public int count;
    public string message;
}