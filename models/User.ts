import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  IsEmail,
  Unique,
  AllowNull,
} from 'sequelize-typescript';

interface UserAttributes {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  email: string;
  password: string;
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<UserAttributes> {
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  nom!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  prenom!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  age!: number;

  @AllowNull(false)
  @Unique
  @IsEmail
  @Column(DataType.STRING)
  declare email : string;

  @AllowNull(false)
  @Column(DataType.STRING)
  password!: string;
}
