import React, { useState } from "react"
import { musicList } from "../musicList"

const MusicPlayer = () => {
  const [selected, setSelected] = useState(musicList[0].url)

  return (
    <div>
      <h3>Müzik Seç</h3>
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
      >
        {musicList.map(music => (
          <option key={music.url} value={music.url}>
            {music.name}
          </option>
        ))}
      </select>
      <audio controls src={selected} style={{ marginTop: 16, width: "100%" }} />
    </div>
  )
}

export default MusicPlayer