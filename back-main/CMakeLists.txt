cmake_minimum_required(VERSION 3.10)
project(gtuverse_backend)

set(CMAKE_CXX_STANDARD 17)

include_directories(
    include
    external/crow
    external/crow/include
    external/asio/asio/include
    /opt/homebrew/Cellar/mysql-connector-c++/9.3.0/include
)

link_directories(
    /opt/homebrew/Cellar/mysql-connector-c++/9.3.0/lib
)

add_executable(gtuverse_backend
    src/main.cpp
    src/user_service.cpp
    src/room_service.cpp 
    src/room.cpp 
    src/room_user_service.cpp
)



target_link_libraries(gtuverse_backend
    PRIVATE
    pthread
    mysqlcppconnx
)

set(SOURCES
    src/main.cpp
    src/user_service.cpp
    src/room_service.cpp
)

