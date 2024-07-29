export class User {
  id: number;
  name: string;
  password: string;
  joined: number;
  color: string;

  constructor(
    id: number,
    name: string,
    password: string,
    joined: number,
    color: string
  ) {
    this.id = id;
    this.name = name;
    this.password = password;
    this.joined = joined;
    this.color = color;
  }
}

export class UserLogin {
  name: string;
  password: string;

  constructor(name: string, password: string) {
    this.name = name;
    this.password = password;
  }
}
