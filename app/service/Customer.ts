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

    const condition = {
      deleted: false,
    }

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

    const reply = await this.model.CustomerPdcView.findAll({
      offset,
      limit,
      order: [
        ['modify_time', 'DESC'],
      ],
      where: condition,
    });

    const total = await this.model.CustomerPdcView.count({
      where: condition,
    });

    return {
      list: reply,
      page: filters.page,
      pageSize: filters.pageSize,
      total,
    }
  }

  async search(filters: any) {
    const { model } = this;
    // const { model } = ctx;
    const {
      search = '',
    } = filters;

    const condition: any = {};
    if (search) {
      condition.name = {
        [model.Op.like]: `%${search}%`,
      }
    }
    
    const customers = await model.Customer.findAll({
      where: condition,
    });

    return {
      customers,
    }
  }

  async create(body) {
    const customer = await this.model.Customer.create(body);

    return {
      id: customer.id,
    }
  }

  async update(id: number, body: any) {
    const customer = await this.model.Customer.findOne({
      where: {id},
    });

    if (!customer) {
      this.ctx.throw(404, 'not found this customer');
      return;
    }

    await this.model.Customer.update({
      name: body.name,
      mobile: body.mobile,
      weixin: body.weixin,
    }, {
      where: {
        id,
      }
    });

    return {
      id,
    }
  }

  async delete(id: number) {
    const customer = await this.model.Customer.findOne({
      where: {id},
    });

    // console.log()

    if (!customer) {
      this.ctx.throw(404, 'not found this customer');
      return;
    }

    await this.model.Customer.update({
      deleted: true,
    }, {
      where: {
        id,
      }
    });

    return true;
  }
}