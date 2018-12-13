import { Service, Context } from 'egg';
import sequelize = require('sequelize');

export default class Customer extends Service {
  model: sequelize.Sequelize;

  constructor(ctx: Context) {
    super(ctx)

    this.model = ctx.model
  }

  async findList(filters: any) {
    const { ctx } = this;
    const { offset, limit } = ctx.helper.parsedPageFromParams(filters);

    const condition = {}

    if (filters.id) {
      condition['id'] = {
        [this.model.Op.like]: `%${filters.id}%`
      }
    }

    if (filters.name) {
      condition['name'] = {
        [this.model.Op.like]: `%${filters.name}%`
      }
    }

    if (filters.mobile) {
      condition['mobile'] = filters.mobile;
    }

    if (filters.weixin) {
      condition['weixin'] = {
        [this.model.Op.like]: `%${filters.weixin}%`
      }
    }

    const reply = await this.model.Customer.findAll({
      offset,
      limit,
      where: condition,
    });

    const total = await this.model.Customer.count({
      where: condition,
    });

    return {
      list: reply,
      page: filters.page,
      pageSize: filters.pageSize,
      total,
    }
  }

  async create(body) {
    const customer = await this.model.Customer.create(body);

    return {
      id: customer.id,
    }
  }
}