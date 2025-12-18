import { IsInt, IsNotEmpty, IsArray } from 'class-validator';

export class AddRadiologyItemDto {
  @IsArray()
  @IsNotEmpty()
  testIds: number[];
}
