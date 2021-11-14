import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const taskSnapshot = new this.taskModel(createTaskDto);
      const taskRecord = await taskSnapshot.save({ session });
      const taskSnapshot2 = new this.taskModel(createTaskDto);
      const taskRecord2 = await taskSnapshot2.save({ session });
      await session.commitTransaction();
      return { taskRecord, taskRecord2 };
    } catch (err) {
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      await session.endSession();
    }
  }

  async findAll() {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      return this.taskModel.find().exec();
    } catch (err) {
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      await session.endSession();
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
