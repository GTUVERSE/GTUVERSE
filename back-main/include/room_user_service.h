#ifndef ROOM_USER_SERVICE_H
#define ROOM_USER_SERVICE_H

#include <mysqlx/xdevapi.h>
#include <vector>
 #include "room.h"
class RoomUserService {
private:
    mysqlx::Session dbSession;
    mysqlx::Schema dbSchema;
    mysqlx::Table roomUsersTable;

public:
    RoomUserService();

    void addUserToRoom(int userId, int roomId);
    std::vector<int> getUsersInRoom(int roomId);
    std::vector<std::pair<int, std::string>> getUsersWithNamesInRoom(int roomId);
    bool removeUserFromRoom(int roomId, int userId);
    std::vector<Room> getRoomsForUser(int userId);
    bool isUserInRoom(int roomId, int userId);
  

};

#endif // ROOM_USER_SERVICE_H
