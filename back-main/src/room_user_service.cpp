#include "../include/room_user_service.h"
#include "../include/room_service.h"
#include "../include/user.h"
#include <iostream>
#include <mysqlx/xdevapi.h>

using namespace mysqlx;
/*
RoomUserService::RoomUserService()
  : dbSession(
      // URI formatında: kullanıcı:şifre@host:port ve SSL kapalı
      "mysqlx://root:funda123@173.212.195.170:3306"
      "?ssl-mode=DISABLED"
    ),
    dbSchema(dbSession.getSchema("gtuverse_db")),
    roomUsersTable(dbSchema.getTable("room_users"))
{}*/
/*
RoomUserService::RoomUserService()
  : dbSession(
      "mysqlx://root:funda123@127.0.0.1:33060?ssl-mode=DISABLED"
    ),
    dbSchema(dbSession.getSchema("gtuverse_db")),
    roomUsersTable(dbSchema.getTable("room_users"))
{}
*/

 RoomUserService::RoomUserService()
  : dbSession(
      // URI formatında: kullanıcı:şifre@host:port ve SSL kapalı
      "mysqlx://remote:funda123@173.212.195.170:33060"
      "?ssl-mode=DISABLED"
    ),
    dbSchema(dbSession.getSchema("gtuverse_db")),
    roomUsersTable(dbSchema.getTable("room_users"))
{}

/*
      void RoomUserService::addUserToRoom(int userId, int roomId) {
        // Kullanıcı zaten odada mı kontrol et
        if (isUserInRoom(roomId, userId)) {
            return; // Kullanıcı zaten odada, işlem yapma
        }
        
        // Odayı getir ve kapasite kontrolü yap
        auto roomService = RoomService();
        auto roomOpt = roomService.getRoomById(roomId);
        
        if (!roomOpt.has_value()) {
            throw std::runtime_error("Room does not exist");
        }
        
        Room room = roomOpt.value();
        
        // Kapasite kontrolü ve oda güncelleme
        if (room.increaseSize()) {
            roomUsersTable.insert("room_id", "user_id")
                .values(roomId, userId)
                .execute();
                
            // Oda boyutunu güncelle
            roomService.updateRoomSize(roomId, room.getSize());
        } else {
            throw std::runtime_error("Room is full");
        }
    }


*/
/*
void RoomUserService::addUserToRoom(int userId, int roomId) {
    // Kullanıcı zaten odada mı kontrol et
    if (isUserInRoom(roomId, userId)) {
        return; // Kullanıcı zaten odada, işlem yapma
    }

    // Odayı getir ve kapasite kontrolü yap
    auto roomService = RoomService();
    auto roomOpt = roomService.getRoomById(roomId);

    if (!roomOpt.has_value()) {
        throw std::runtime_error("Room does not exist");
    }

    Room room = roomOpt.value();

    // Kapasite kontrolü ve oda güncelleme
    if (!room.increaseSize()) {
        throw std::runtime_error("Room is full");
    }

    // Boşta olan place (port) değerini bul
    std::vector<int> usedPorts;
    //auto result = dbSession.sql("SELECT place FROM users WHERE place IS NOT NULL").execute();
    auto result = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE place IS NOT NULL").execute();

    for (auto row : result) {
        usedPorts.push_back(row[0].get<int>());
    }

    int assignedPlace = -1;
    for (int port = 72500; port <= 72507; ++port) {
        if (std::find(usedPorts.begin(), usedPorts.end(), port) == usedPorts.end()) {
            assignedPlace = port;
            break;
        }
    }

    if (assignedPlace == -1) {
        throw std::runtime_error("No available port (place) left");
    }

    // Kullanıcıyı room_users tablosuna ekle
    roomUsersTable.insert("room_id", "user_id")
        .values(roomId, userId)
        .execute();

    // Kullanıcının place (port) değerini güncelle
    dbSession.sql("UPDATE users SET place = ? WHERE id = ?")
        .bind(assignedPlace, userId)
        .execute();

    // Oda boyutunu güncelle
    roomService.updateRoomSize(roomId, room.getSize());
}
*/
/*
void RoomUserService::addUserToRoom(int userId, int roomId) {
    // Kullanıcı zaten odada mı kontrol et
    if (isUserInRoom(roomId, userId)) {
        throw std::runtime_error("User is already in this room");
    }

    // Odayı getir ve kapasite kontrolü yap
    auto roomService = RoomService();
    auto roomOpt = roomService.getRoomById(roomId);

    if (!roomOpt.has_value()) {
        throw std::runtime_error("Room does not exist");
    }

    Room room = roomOpt.value();

    // Kapasite kontrolü
    if (!room.increaseSize()) {
        throw std::runtime_error("Room is full");
    }

    // Kullanılan portları bul
    std::vector<int> usedPorts;
    auto result = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE place IS NOT NULL").execute();
    for (auto row : result) {
        usedPorts.push_back(row[0].get<int>());
    }

    int assignedPlace = -1;
    for (int port = 72500; port <= 72507; ++port) {
        if (std::find(usedPorts.begin(), usedPorts.end(), port) == usedPorts.end()) {
            assignedPlace = port;
            break;
        }
    }

    if (assignedPlace == -1) {
        throw std::runtime_error("No available port (place) left");
    }

    // room_users tablosuna ekle
    auto insertResult = roomUsersTable.insert("room_id", "user_id")
        .values(roomId, userId)
        .execute();

    // Eğer ekleme başarısızsa portu atama!
    if (insertResult.getAffectedItemsCount() == 0) {
        throw std::runtime_error("Failed to add user to room");
    }

    // Kullanıcıya portu ata
  //  dbSession.sql("UPDATE users SET place = ? WHERE id = ?")
  dbSession.sql("UPDATE place FROM gtuverse_db.users WHERE place IS NOT NULL")     
  .bind(assignedPlace, userId)
        .execute();

    // Oda boyutunu güncelle
    roomService.updateRoomSize(roomId, room.getSize());
}*/
/*
void RoomUserService::addUserToRoom(int userId, int roomId) {
    // Kullanıcı zaten odada mı kontrol et
    if (isUserInRoom(roomId, userId)) {
        throw std::runtime_error("User is already in this room");
    }

    // Odayı getir ve kapasite kontrolü yap
    auto roomService = RoomService();
    auto roomOpt = roomService.getRoomById(roomId);

    if (!roomOpt.has_value()) {
        throw std::runtime_error("Room does not exist");
    }

    Room room = roomOpt.value();

    // Kapasite kontrolü
    if (!room.increaseSize()) {
        throw std::runtime_error("Room is full");
    }

    // Kullanılan portları bul
    std::vector<int> usedPorts;
    auto result = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE place IS NOT NULL").execute();
    for (auto row : result) {
        usedPorts.push_back(row[0].get<int>());
    }

    int assignedPlace = -1;
    for (int port = 52700; port <= 52707; ++port) {
        if (std::find(usedPorts.begin(), usedPorts.end(), port) == usedPorts.end()) {
            assignedPlace = port;
            break;
        }
    }

    if (assignedPlace == -1) {
        throw std::runtime_error("No available port (place) left");
    }

    // room_users tablosuna ekle
    auto insertResult = roomUsersTable.insert("room_id", "user_id")
        .values(roomId, userId)
        .execute();

    if (insertResult.getAffectedItemsCount() == 0) {
        throw std::runtime_error("Failed to add user to room");
    }

    // Kullanıcıya portu ata (DÜZELTİLEN SATIR)
    dbSession.sql("UPDATE gtuverse_db.users SET place = ? WHERE id = ?")
        .bind(assignedPlace, userId)
        .execute();

    // Oda boyutunu güncelle
    roomService.updateRoomSize(roomId, room.getSize());
}
*/

/*
void RoomUserService::addUserToRoom(int userId, int roomId) {
    // Kullanıcı zaten odada mı kontrol et
    if (isUserInRoom(roomId, userId)) {
        throw std::runtime_error("User is already in this room");
    }

    // Kullanıcıya zaten bir port atanmış mı? (Başka bir odada mı?)
    auto userPlaceResult = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE id = ?")
        .bind(userId)
        .execute();
    for (auto row : userPlaceResult) {
        if (!row[0].isNull()) {
            throw std::runtime_error("User is already in a room");
        }
    }

    // Odayı getir ve kapasite kontrolü yap
    auto roomService = RoomService();
    auto roomOpt = roomService.getRoomById(roomId);

    if (!roomOpt.has_value()) {
        throw std::runtime_error("Room does not exist");
    }

    Room room = roomOpt.value();

    // Kapasite kontrolü
    if (!room.increaseSize()) {
        throw std::runtime_error("Room is full");
    }

    // Kullanılan portları bul
    std::vector<int> usedPorts;
    auto result = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE place IS NOT NULL").execute();
    for (auto row : result) {
        usedPorts.push_back(row[0].get<int>());
    }

    int assignedPlace = -1;
    for (int port = 52700; port <= 52707; ++port) {
        if (std::find(usedPorts.begin(), usedPorts.end(), port) == usedPorts.end()) {
            assignedPlace = port;
            break;
        }
    }

    if (assignedPlace == -1) {
        throw std::runtime_error("No available port (place) left");
    }

    // room_users tablosuna ekle
    auto insertResult = roomUsersTable.insert("room_id", "user_id")
        .values(roomId, userId)
        .execute();

    if (insertResult.getAffectedItemsCount() == 0) {
        throw std::runtime_error("Failed to add user to room");
    }

    // Kullanıcıya portu ata
    dbSession.sql("UPDATE gtuverse_db.users SET place = ? WHERE id = ?")
        .bind(assignedPlace, userId)
        .execute();

    // Oda boyutunu güncelle
    roomService.updateRoomSize(roomId, room.getSize());
}*/
/*

void RoomUserService::addUserToRoom(int userId, int roomId) {
    // Kullanıcı başka bir odada mı? (place NULL değilse)
    auto userPlaceResult = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE id = ?")
        .bind(userId)
        .execute();
    for (auto row : userPlaceResult) {
        if (!row[0].isNull()) {
            throw std::runtime_error("User is already in a room");
        }
    }

    // Kullanıcı zaten bu odada mı?
    if (isUserInRoom(roomId, userId)) {
        throw std::runtime_error("User is already in this room");
    }

    // Odayı getir ve kapasite kontrolü yap
    auto roomService = RoomService();
    auto roomOpt = roomService.getRoomById(roomId);

    if (!roomOpt.has_value()) {
        throw std::runtime_error("Room does not exist");
    }

    Room room = roomOpt.value();

    // Kapasite kontrolü
    if (!room.increaseSize()) {
        throw std::runtime_error("Room is full");
    }

    // Kullanılan portları bul
    std::vector<int> usedPorts;
    auto result = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE place IS NOT NULL").execute();
    for (auto row : result) {
        usedPorts.push_back(row[0].get<int>());
    }

    int assignedPlace = -1;
    for (int port = 52700; port <= 52707; ++port) {
        if (std::find(usedPorts.begin(), usedPorts.end(), port) == usedPorts.end()) {
            assignedPlace = port;
            break;
        }
    }

    if (assignedPlace == -1) {
        throw std::runtime_error("No available port (place) left");
    }

    // room_users tablosuna ekle
    auto insertResult = roomUsersTable.insert("room_id", "user_id")
        .values(roomId, userId)
        .execute();

    if (insertResult.getAffectedItemsCount() == 0) {
        throw std::runtime_error("Failed to add user to room");
    }

    // Kullanıcıya portu ata
    dbSession.sql("UPDATE gtuverse_db.users SET place = ? WHERE id = ?")
        .bind(assignedPlace, userId)
        .execute();

    // Oda boyutunu güncelle
    roomService.updateRoomSize(roomId, room.getSize());
}
*/

/*
void RoomUserService::addUserToRoom(int userId, int roomId) {
    // Kullanıcı başka bir odada mı? (place NULL değilse)
    auto userPlaceResult = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE id = ?")
        .bind(userId)
        .execute();
    for (auto row : userPlaceResult) {
        if (!row[0].isNull()) {
            throw std::runtime_error("User is already in a room");
        }
    }

    // Kullanıcı zaten bu odada mı?
    if (isUserInRoom(roomId, userId)) {
        throw std::runtime_error("User is already in this room");
    }

    // Odayı getir ve kapasite kontrolü yap
    auto roomService = RoomService();
    auto roomOpt = roomService.getRoomById(roomId);

    if (!roomOpt.has_value()) {
        throw std::runtime_error("Room does not exist");
    }

    Room room = roomOpt.value();

    // Kapasite kontrolü
    if (!room.increaseSize()) {
        throw std::runtime_error("Room is full");
    }

    // Odaya şu an kaç kişi var?
    auto userIds = getUsersInRoom(roomId);
    int currentSize = userIds.size();

    // IP seçimi: 1-3-5-7. girenler IP_A, 2-4-6-8. girenler IP_B
    std::string assignedIp = ((currentSize % 2) == 0) ? IP_A : IP_B;

    // Kullanılan portları bul
    std::vector<int> usedPorts;
    auto result = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE place IS NOT NULL").execute();
    for (auto row : result) {
        usedPorts.push_back(row[0].get<int>());
    }

    int assignedPlace = -1;
    for (int port = 52700; port <= 52707; ++port) {
        if (std::find(usedPorts.begin(), usedPorts.end(), port) == usedPorts.end()) {
            assignedPlace = port;
            break;
        }
    }

    if (assignedPlace == -1) {
        throw std::runtime_error("No available port (place) left");
    }

    // room_users tablosuna ekle
    auto insertResult = roomUsersTable.insert("room_id", "user_id")
        .values(roomId, userId)
        .execute();

    if (insertResult.getAffectedItemsCount() == 0) {
        throw std::runtime_error("Failed to add user to room");
    }

    // Kullanıcıya portu ve ip'yi ata
    dbSession.sql("UPDATE gtuverse_db.users SET place = ?, ip = ? WHERE id = ?")
        .bind(assignedPlace, assignedIp, userId)
        .execute();

    // Oda boyutunu güncelle
    roomService.updateRoomSize(roomId, room.getSize());
}
*/

void RoomUserService::addUserToRoom(int userId, int roomId) {
    // Kullanıcı başka bir odada mı? (place NULL değilse)
    auto userPlaceResult = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE id = ?")
        .bind(userId)
        .execute();
    for (auto row : userPlaceResult) {
        if (!row[0].isNull()) {
            throw std::runtime_error("User is already in a room");
        }
    }

    // Kullanıcı zaten bu odada mı?
    if (isUserInRoom(roomId, userId)) {
        throw std::runtime_error("User is already in this room");
    }

    // Odayı getir ve kapasite kontrolü yap
    auto roomService = RoomService();
    auto roomOpt = roomService.getRoomById(roomId);

    if (!roomOpt.has_value()) {
        throw std::runtime_error("Room does not exist");
    }

    Room room = roomOpt.value();

    // Kapasite kontrolü
    if (!room.increaseSize()) {
        throw std::runtime_error("Room is full");
    }

    // Odaya şu an kaç kişi var ve hangi IP'ler atanmış?
    auto userIds = getUsersInRoom(roomId);
    int countA = 0, countB = 0;
    if (!userIds.empty()) {
        std::string query = "SELECT ip FROM gtuverse_db.users WHERE id IN (";
        for (size_t i = 0; i < userIds.size(); ++i) {
            query += std::to_string(userIds[i]);
            if (i != userIds.size() - 1) query += ",";
        }
        query += ")";
        auto result = dbSession.sql(query).execute();
        for (auto row : result) {
            std::string ip = row[0].isNull() ? "" : row[0].get<std::string>();
            if (ip == IP_A) countA++;
            else if (ip == IP_B) countB++;
        }
    }

    // Hangi IP daha az kullanılıyorsa onu ata (eşitse önce A)
    std::string assignedIp = (countA <= countB) ? IP_A : IP_B;

    // Kullanılan portları bul
    std::vector<int> usedPorts;
    auto result = dbSession.sql("SELECT place FROM gtuverse_db.users WHERE place IS NOT NULL").execute();
    for (auto row : result) {
        usedPorts.push_back(row[0].get<int>());
    }

    int assignedPlace = -1;
    for (int port = 52700; port <= 52707; ++port) {
        if (std::find(usedPorts.begin(), usedPorts.end(), port) == usedPorts.end()) {
            assignedPlace = port;
            break;
        }
    }

    if (assignedPlace == -1) {
        throw std::runtime_error("No available port (place) left");
    }

    // room_users tablosuna ekle
    auto insertResult = roomUsersTable.insert("room_id", "user_id")
        .values(roomId, userId)
        .execute();

    if (insertResult.getAffectedItemsCount() == 0) {
        throw std::runtime_error("Failed to add user to room");
    }

    // Kullanıcıya portu ve ip'yi ata
    dbSession.sql("UPDATE gtuverse_db.users SET place = ?, ip = ? WHERE id = ?")
        .bind(assignedPlace, assignedIp, userId)
        .execute();

    // Oda boyutunu güncelle
    roomService.updateRoomSize(roomId, room.getSize());
}

std::vector<int> RoomUserService::getUsersInRoom(int roomId) {
    std::vector<int> userIds;
    auto result = roomUsersTable.select("user_id")
                                .where("room_id = :rid")
                                .bind("rid", roomId)
                                .execute();
    for (auto row : result) {
        userIds.push_back(row[0].get<int>());
    }
    return userIds;
}

std::vector<std::pair<int, std::string>> RoomUserService::getUsersWithNamesInRoom(int roomId) {
    std::vector<std::pair<int, std::string>> users;

    std::string query =
    "SELECT users.id, users.username "
    "FROM gtuverse_db.room_users "
    "JOIN gtuverse_db.users ON room_users.user_id = users.id "
    "WHERE room_users.room_id = ?";

    auto stmt = dbSession.sql(query);
    stmt.bind(roomId);
    auto result = stmt.execute();

    for (auto row : result) {
        int id = row[0].get<int>();
        std::string username = row[1].get<std::string>();
        users.emplace_back(id, username);
    }

    return users;
}

/*
bool RoomUserService::removeUserFromRoom(int roomId, int userId) {
    try {
        // Kullanıcı odada mı kontrol et
        if (!isUserInRoom(roomId, userId)) {
            return false; // Kullanıcı odada değilse işlem yapma
        }
        
        // Odayı getir
        auto roomService = RoomService();
        auto roomOpt = roomService.getRoomById(roomId);
        
        if (!roomOpt.has_value()) {
            return false;
        }
        
        Room room = roomOpt.value();
        room.decreaseSize();
       // Kullanıcıyı odadan çıkar
       auto result = roomUsersTable.remove()
       .where("room_id = :roomId AND user_id = :userId")
       .bind("roomId", roomId)
       .bind("userId", userId)
       .execute();
       
   // Oda boyutunu güncelle
   roomService.updateRoomSize(roomId, room.getSize());
   
   return result.getAffectedItemsCount() > 0;
} catch (const std::exception& e) {
   std::cerr << "Error removing user from room: " << e.what() << std::endl;
   return false;
}
} 
*/
/*
bool RoomUserService::removeUserFromRoom(int roomId, int userId) {
    try {
        // Kullanıcı odada mı kontrol et
        if (!isUserInRoom(roomId, userId)) {
            return false; // Kullanıcı odada değilse işlem yapma
        }

        // Odayı getir
        auto roomService = RoomService();
        auto roomOpt = roomService.getRoomById(roomId);

        if (!roomOpt.has_value()) {
            return false;
        }

        Room room = roomOpt.value();
        room.decreaseSize();

        // Kullanıcıyı odadan çıkar
        auto result = roomUsersTable.remove()
            .where("room_id = :roomId AND user_id = :userId")
            .bind("roomId", roomId)
            .bind("userId", userId)
            .execute();

        // Oda boyutunu güncelle
        roomService.updateRoomSize(roomId, room.getSize());

        // Kullanıcının place bilgisini sıfırla
       // dbSession.sql("UPDATE users SET place = NULL WHERE id = ?")
         //   .bind(userId)
         //   .execute();
         dbSession.sql("UPDATE gtuverse_db.users SET place = ? WHERE id = ?")
    .bind(assignedPlace, userId)
    .execute();

        return result.getAffectedItemsCount() > 0;
    } catch (const std::exception& e) {
        std::cerr << "Error removing user from room: " << e.what() << std::endl;
        return false;
    }
}
    */
/*

    bool RoomUserService::removeUserFromRoom(int roomId, int userId) {
    try {
        // Kullanıcı odada mı kontrol et
        if (!isUserInRoom(roomId, userId)) {
            return false; // Kullanıcı odada değilse işlem yapma
        }

        // Odayı getir
        auto roomService = RoomService();
        auto roomOpt = roomService.getRoomById(roomId);

        if (!roomOpt.has_value()) {
            return false;
        }

        Room room = roomOpt.value();
        room.decreaseSize();

        // Kullanıcıyı odadan çıkar
        auto result = roomUsersTable.remove()
            .where("room_id = :roomId AND user_id = :userId")
            .bind("roomId", roomId)
            .bind("userId", userId)
            .execute();

        // Oda boyutunu güncelle
        roomService.updateRoomSize(roomId, room.getSize());

        // Kullanıcının place bilgisini NULL yap
        dbSession.sql("UPDATE gtuverse_db.users SET place = NULL WHERE id = ?")
            .bind(userId)
            .execute();

        return result.getAffectedItemsCount() > 0;
    } catch (const std::exception& e) {
        std::cerr << "Error removing user from room: " << e.what() << std::endl;
        return false;
    }
}

*/

bool RoomUserService::removeUserFromRoom(int roomId, int userId) {
    try {
        // Kullanıcı odada mı kontrol et
        if (!isUserInRoom(roomId, userId)) {
            return false; // Kullanıcı odada değilse işlem yapma
        }

        // Odayı getir
        auto roomService = RoomService();
        auto roomOpt = roomService.getRoomById(roomId);

        if (!roomOpt.has_value()) {
            return false;
        }

        Room room = roomOpt.value();
        room.decreaseSize();

        // Kullanıcıyı odadan çıkar
        auto result = roomUsersTable.remove()
            .where("room_id = :roomId AND user_id = :userId")
            .bind("roomId", roomId)
            .bind("userId", userId)
            .execute();

        // Oda boyutunu güncelle
        roomService.updateRoomSize(roomId, room.getSize());

        // Kullanıcının place ve ip bilgisini NULL yap
        dbSession.sql("UPDATE gtuverse_db.users SET place = NULL, ip = NULL WHERE id = ?")
            .bind(userId)
            .execute();

        return result.getAffectedItemsCount() > 0;
    } catch (const std::exception& e) {
        std::cerr << "Error removing user from room: " << e.what() << std::endl;
        return false;
    }
}

/*
std::vector<Room> RoomUserService::getRoomsForUser(int userId) {
    std::vector<Room> rooms;

    std::string query =
        "SELECT rooms.id, rooms.name, rooms.size ,rooms.type"
        "FROM gtuverse_db.room_users "
        "JOIN gtuverse_db.rooms ON room_users.room_id = rooms.id "
        "WHERE room_users.user_id = ?";

    auto stmt = dbSession.sql(query);
    stmt.bind(userId);
    auto result = stmt.execute();

    for (auto row : result) {
        int id = row[0].get<int>();
        std::string name = row[1].get<std::string>();
        int size = row[2].get<int>();
        std::string type  = row[3].get<std::string>();
        rooms.emplace_back(id, name, size,type);
    }

    return rooms;
}
*/
std::vector<Room> RoomUserService::getRoomsForUser(int userId) {
    std::vector<Room> rooms;
    try {
        std::string query = 
            "SELECT rooms.id, rooms.name, rooms.size, rooms.type "
            "FROM gtuverse_db.room_users "
            "JOIN gtuverse_db.rooms ON room_users.room_id = rooms.id "
            "WHERE room_users.user_id = ?";

        auto stmt = dbSession.sql(query);
        stmt.bind(userId);
        auto result = stmt.execute();

        for (auto row : result) {
            int id = row[0].get<int>();
            std::string name = row[1].get<std::string>();
            int size = row[2].get<int>();
            std::string type = row[3].get<std::string>();
            
            // Room constructor'ı 4 parametre alıyor: id, name, size, type
            rooms.emplace_back(id, name, size, type);
        }
    } catch (const std::exception& e) {
        std::cerr << "Error in getRoomsForUser: " << e.what() << std::endl;
    }
    
    return rooms;
}

bool RoomUserService::isUserInRoom(int roomId, int userId) {
    try {
        auto result = roomUsersTable.select("room_id")
            .where("room_id = :rid AND user_id = :uid")
            .bind("rid", roomId)
            .bind("uid", userId)
            .execute();

        std::cerr << "isUserInRoom(" << roomId << ", " << userId << ") → count = " << result.count() << std::endl;

        return result.count() > 0;
    } catch (const std::exception& e) {
        std::cerr << "Error in isUserInRoom: " << e.what() << std::endl;
        return false;
    }
}


