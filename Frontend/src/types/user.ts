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
