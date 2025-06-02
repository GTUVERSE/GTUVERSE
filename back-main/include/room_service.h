#ifndef ROOM_SERVICE_H
#define ROOM_SERVICE_H

#include "room.h"
#include <mysqlx/xdevapi.h>
#include <vector>
#include <optional>

using namespace mysqlx;

class RoomService {
private:
    Session dbSession;
    Schema dbSchema;
    mutable Table roomsTable;


public:
    RoomService();

    void createRoom(const Room& room);
    std::optional<Room> getRoomById(int id)const;
    std::vector<Room> getAllRooms()const;
    bool deleteRoom(int id);
    bool roomExistsByName(const std::string& name) const;
    void updateRoomSize(int roomId, int newSize);
    bool incrementRoomSize(int roomId);
bool updateAllRoomsApi(const std::string& newApi); 




bool updateRoom(const Room& room);
    std::vector<Room> getRoomsByType(const std::string& type) const;

};

#endif
