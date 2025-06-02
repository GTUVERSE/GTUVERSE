#ifndef ROOM_H
#define ROOM_H

#include <string>

class Room {
private:
    int id;
    std::string name;
    int size;
     std::string type;
        std::string url;
    const int capacity = 8;
       std::string api = "192.168.0.1"; 

public:
    Room();
   // Room(int id, const std::string& name, int size, const std::string& type, const std::string& url);
 Room(int id, const std::string& name, int size, const std::string& type);



    int getId() const;
    std::string getName() const;
    int getCapacity() const;

    void setName(const std::string& newName);
    void setSize(int newSize);
    int getSize() const;

     const std::string& getUrl() const;
    void setUrl(const std::string& newUrl);
     // Yeni metotlar
     bool increaseSize(); // Odaya kullanıcı eklendiğinde size arttır
     bool decreaseSize(); // Odadan kullanıcı çıktığında size azalt
  const std::string& getType() const;
    void setType(const std::string& t);
       //const std::string& getApi() const { return api; }
      // void setApi(const std::string& newApi) { api = newApi; }
 const std::string& getApi() const;
void setApi(const std::string& newApi);
};

#endif
