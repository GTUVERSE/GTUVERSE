class Room {
  final int id;
  final String name;
  final int size;
  final int capacity;

  Room({
    required this.id,
    required this.name,
    required this.size,
    required this.capacity,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'],
      name: json['name'],
      size: json['size'],
      capacity: json['capacity'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'size': size,
      'capacity': capacity,
    };
  }
}