#include "../include/room.h"

Room::Room() : id(0), name(""), size(0) {}

/*Room::Room(int id, const std::string& name, int size, const std::string& type, const std::string& url)
    : id(id), name(name), size(size), type(type), url(url) {}*/

 Room::Room(int id, const std::string& name, int size, const std::string& type)
    : id(id), name(name), size(size), type(type) {}


int Room::getId() const {
    return id;
}
// getType ve setType tanımları — mutlaka Room:: kapsamıyla
const std::string& Room::getType() const {
    return type;
}

void Room::setType(const std::string& t) {
    type = t;
}

std::string Room::getName() const {
    return name;
}

int Room::getCapacity() const {
    return capacity;
}

void Room::setName(const std::string& newName) {
    name = newName;
}

void Room::setSize(int newSize) {
    size = newSize;
}




int Room::getSize() const {
    return size;
}

bool Room::increaseSize() {
    // Kapasite kontrolü
    if (size < capacity) {
        size++;
        return true; // Size başarıyla arttı
    }
    return false; // Oda dolu, kullanıcı eklenemedi
}

bool Room::decreaseSize() {
    // Oda boş değilse çıkış işlemi yap
    if (size > 0) {
        size--;
        return true; // Size başarıyla azaltıldı
    }
    return false; // Odada zaten kimse yok
}


const std::string& Room::getUrl() const {
    return url;
}

void Room::setUrl(const std::string& newUrl) {
    url = newUrl;
}


const std::string& Room::getApi() const {
    return api;
}
void Room::setApi(const std::string& newApi) {
    api = newApi;
}