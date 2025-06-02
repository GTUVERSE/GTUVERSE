#include "../include/room_service.h"
#include <iostream>

  /*RoomService::RoomService()
  : dbSession(
      // URI formatında: kullanıcı:şifre@host:port ve SSL kapalı
      "mysqlx://remote:funda123@173.212.195.170:33060"
      "?ssl-mode=DISABLED"
    ),
    dbSchema(dbSession.getSchema("gtuverse_db")),
    roomsTable(dbSchema.getTable("rooms"))
{}*/
/*
RoomService::RoomService()
  : dbSession(
      "mysqlx://root:funda123@127.0.0.1:3306?ssl-mode=DISABLED"
    ),
    dbSchema(dbSession.getSchema("gtuverse_db")),
    roomsTable(dbSchema.getTable("rooms"))
{}
*/
 RoomService::RoomService()
  : dbSession(
      // URI formatında: kullanıcı:şifre@host:port ve SSL kapalı
      "mysqlx://remote:funda123@173.212.195.170:33060"
      "?ssl-mode=DISABLED"
    ),
    dbSchema(dbSession.getSchema("gtuverse_db")),
    roomsTable(dbSchema.getTable("rooms"))
{}


/*
RoomService::RoomService()
  : dbSession(
      // URI formatında: kullanıcı:şifre@host:port ve SSL kapalı
      "mysqlx://root:burak123@173.212.195.170:33060" // ŞİFREYİ BURADA GÜNCELLE
      "?ssl-mode=DISABLED"
    ),
    dbSchema(dbSession.getSchema("gtuverse_db")),
    roomsTable(dbSchema.getTable("rooms"))
{}*/
/*
RoomService::RoomService()
  : dbSession(
      "mysqlx://root:funda123@127.0.0.1:33060?ssl-mode=DISABLED"
    ),
    dbSchema(dbSession.getSchema("gtuverse_db")),
    roomsTable(dbSchema.getTable("rooms"))
{}*/




     /* 
      void RoomService::createRoom(const Room& room) {
        if (roomExistsByName(room.getName())) {
            throw std::runtime_error("Room with the same name already exists");
        }
    
        roomsTable.insert("name", "size", "type") // Oda tipi eklendi
                  .values(room.getName(), room.getSize(), room.getType()) // Oda tipi eklendi
                  .execute();
    }
    
// getRoomById: SELECT ve Room kurucusu artık 4 argümanlı
std::optional<Room> RoomService::getRoomById(int id) const {
    auto result = roomsTable
                    .select("id", "name", "size", "type", "url")
                    .where("id = :id").bind("id", id)
                    .execute();

    for (auto row : result) {
        Room room(
            row[0].get<int>(),            // id
            row[1].get<std::string>(),    // name
            row[2].get<int>(),            // size
            row[3].get<std::string>()     // type
        );
        room.setUrl(row[4].get<std::string>()); // url dışarıdan atanıyor
        return room;
    }
    return std::nullopt;
}*/


std::optional<Room> RoomService::getRoomById(int id) const {
    auto result = roomsTable
                   // .select("id", "name", "size", "type", "url")
                   .select("id", "name", "size", "type", "url", "api")
                    .where("id = :id").bind("id", id)
                    .execute();

    for (auto row : result) {
        Room room(
            row[0].get<int>(),            // id
            row[1].get<std::string>(),    // name
            row[2].get<int>(),            // size
            row[3].get<std::string>()     // type
        );
       // room.setUrl(row[4].get<std::string>()); // url dışarıdan atanıyor
       
room.setUrl(row[4].isNull() ? "" : row[4].get<std::string>());
room.setApi(row[5].isNull() ? "192.168.0.1" : row[5].get<std::string>());

       return room;
    }
    return std::nullopt;
}

/*
void RoomService::createRoom(const Room& room) {
    if (roomExistsByName(room.getName())) {
        throw std::runtime_error("Room with the same name already exists");
    }

    auto result = roomsTable.insert("name", "size", "type")
                            .values(room.getName(), room.getSize(), room.getType())
                            .execute();

    int newId = result.getAutoIncrementValue();

    // URL oluştur
    std::string url = "video/" + std::to_string(newId) + "/room";

    // URL’yi güncelle
    roomsTable.update()
              .set("url", url)
              .where("id = :id")
              .bind("id", newId)
              .execute();
}
              */


std::vector<Room> RoomService::getAllRooms() const {
    std::vector<Room> resultList;
    auto result = roomsTable
                  //  .select("id", "name", "size", "type", "url")
                  .select("id", "name", "size", "type", "url", "api")
                    .execute();

    for (auto row : result) {
        Room room(
            row[0].get<int>(),            // id
            row[1].get<std::string>(),    // name
            row[2].get<int>(),            // size
            row[3].get<std::string>()     // type
        );
       // room.setUrl(row[4].get<std::string>()); // url sonradan atanıyor
      
room.setUrl(row[4].isNull() ? "" : row[4].get<std::string>());

room.setApi(row[5].isNull() ? "192.168.0.1" : row[5].get<std::string>());

       resultList.push_back(room);
    }
    return resultList;
}



bool RoomService::deleteRoom(int id) {
    auto result = roomsTable
                    .remove()
                    .where("id = :id").bind("id", id)
                    .execute();
    return result.getAffectedItemsCount() > 0;
}


bool RoomService::roomExistsByName(const std::string& name) const {
    auto result = roomsTable
                    .select("id")
                    .where("name = :name")
                    .bind("name", name)
                    .execute();
    return result.count() > 0;
}

void RoomService::updateRoomSize(int roomId, int newSize) {
    roomsTable.update()
        .set("size", newSize)
        .where("id = :id")
        .bind("id", roomId)
        .execute();
}

bool RoomService::incrementRoomSize(int roomId) {
    auto roomOpt = getRoomById(roomId);
    if (roomOpt.has_value()) {
        Room& room = *roomOpt;
        room.setSize(room.getSize() + 1);
        updateRoom(room); // DB güncellemesi yapılıyorsa
        return true;
    }
    return false;
}


bool RoomService::updateRoom(const Room& room) {
    try {
        roomsTable.update()
            .set("size", room.getSize())
            .where("id = :id")
            .bind("id", room.getId())
            .execute();
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Error updating room: " << e.what() << std::endl;
        return false;
    }
}

std::vector<Room> RoomService::getRoomsByType(const std::string& type) const {
    std::vector<Room> resultList;
    auto result = roomsTable
                    .select("id", "name", "size", "type")
                    .where("LOWER(type) = LOWER(:type)")  // Büyük/küçük harf duyarsız karşılaştırma
                    .bind("type", type)
                    .execute();

    for (auto row : result) {
        resultList.emplace_back(
            row[0].get<int>(),            // id
            row[1].get<std::string>(),    // name
            row[2].get<int>(),            // size
            row[3].get<std::string>()     // type
        );
    }
    return resultList;
}



void RoomService::createRoom(const Room& room) {
    if (roomExistsByName(room.getName())) {
        throw std::runtime_error("Room with the same name already exists");
    }

    auto result = roomsTable.insert("name", "size", "type", "api")
                            .values(room.getName(), room.getSize(), room.getType(), room.getApi())
                            .execute();

    int newId = result.getAutoIncrementValue();

    // URL oluştur
    std::string url = "video/" + std::to_string(newId) + "/room";

    // URL’yi güncelle
    roomsTable.update()
              .set("url", url)
              .where("id = :id")
              .bind("id", newId)
              .execute();
}



bool RoomService::updateAllRoomsApi(const std::string& newApi) {
    try {
        auto result = roomsTable.update().set("api", newApi).execute();
        return result.getAffectedItemsCount() > 0;
    } catch (...) {
        return false;
    }
}