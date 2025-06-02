#ifndef USER_H
#define USER_H

#include <string>


const std::string IP_A = "192.168.255.198";
const std::string IP_B = "194.124.223.198";


struct User {
    int id;
    std::string username;
    std::string password;
    std::string email;
      int place; 
     std::string type;
       std::string ip;
};

#endif
