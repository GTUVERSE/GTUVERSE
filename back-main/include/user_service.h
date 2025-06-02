#include "user.h"
#include <mysqlx/xdevapi.h>
#include <vector>
#include <optional>

class UserService {
public:
    UserService();  // constructor
    bool registerUser(const std::string& username,const std::string& email, const std::string& password);
    std::optional<User> loginUser(const std::string& username, const std::string& password);
    std::vector<User> getAllUsers();
     std::optional<User> getUserByUsername(const std::string& username);
   bool updateUsername(int userId, const std::string& newUsername);
 std::optional<User> getUserById(int id);
  bool deleteUser(int userId); 


private:
    mysqlx::Session session;
    mysqlx::Schema schema;
    mysqlx::Table usersTable;
};
