import { IHandler, IQuery } from "@monorepo/core-design-patterns-cqrs";   
import { Err, Ok, Result } from "@monorepo/core-design-patterns";

import { describe, it, expect } from "vitest"; 
import { IMessage, IBehavior, IContextPipeline, PipelineContext, Mediator, IBehaviorResult, Pipeline } 
  from "@monorepo/core-design-patterns-mediator";

/* =============================================================================
 * Domain models
 * ============================================================================= */

type  Customer= { readonly id: number; readonly name: string; readonly isActive: boolean };
type Invoice = { readonly invoiceId: number; readonly customerId: number; readonly paid: boolean };
type Order = { readonly orderId: string; readonly customerId: number };

type CustomerNotFound = { readonly reason: string };
type PaymentFailed = { readonly reason: string };
type OrderError = { readonly reason: string };

type OrderCreated = { readonly orderId: string; readonly customerId: number };

/* =============================================================================
 * IDatabase abstraction (port)
 * ============================================================================= */

interface IDatabase {
  getCustomer(id: number): Promise<Customer | null>;
  getInvoice(id: number): Promise<Invoice | null>;

  createOrder(order: Order): Promise<void>;
  markInvoicePaid(invoiceId: number): Promise<void>;
}

/* =============================================================================
 * FakeDatabase (adapter)
 * ============================================================================= */

class FakeDatabase implements IDatabase {
  private readonly customers = new Map<number, Customer>();
  private readonly invoices = new Map<number, Invoice>();
  private readonly orders = new Map<string, Order>();

  public seedCustomer(c: Customer): this {
    this.customers.set(c.id, c);
    return this;
  }

  public seedInvoice(i: Invoice): this {
    this.invoices.set(i.invoiceId, i);
    return this;
  }

  public async getCustomer(id: number): Promise<Customer | null> {
    return this.customers.get(id) ?? null;
  }

  public async getInvoice(id: number): Promise<Invoice | null> {
    return this.invoices.get(id) ?? null;
  }

  public async createOrder(order: Order): Promise<void> {
    this.orders.set(order.orderId, order);
  }

  public async markInvoicePaid(invoiceId: number): Promise<void> {
    const inv = this.invoices.get(invoiceId);
    if (!inv) return;

    this.invoices.set(invoiceId, { ...inv, paid: true });
  }

  // test helpers
  public orderExists(orderId: string): boolean {
    return this.orders.has(orderId);
  }

  public invoicePaid(invoiceId: number): boolean {
    return this.invoices.get(invoiceId)?.paid ?? false;
  }
}

/* =============================================================================
 * CustomerValidationBehavior (demonstration)
 * - validates: customer exists and isActive
 * - applies to any message that has customerId
 * ============================================================================= */

interface IHasCustomerId {
  readonly customerId: number;
}

type CustomerValidationOk = { readonly behavior: "customer.validation" };
type CustomerValidationErr = { readonly behavior: "customer.validation"; readonly reason: string };

class CustomerValidationBehavior<TMsg extends IMessage & IHasCustomerId>
  implements IBehavior<TMsg, CustomerValidationOk, CustomerValidationErr>
{
  public constructor(private readonly db: IDatabase) {}

  public async execute(
    _ctx: IContextPipeline,
    msg: TMsg
  ): Promise<Result<CustomerValidationOk, CustomerValidationErr>> {
    const customer = await this.db.getCustomer(msg.customerId);

    if (!customer) {
      return Err<CustomerValidationOk, CustomerValidationErr>({
        behavior: "customer.validation",
        reason: `Customer ${msg.customerId} not found`,
      });
    }

    if (!customer.isActive) {
      return Err<CustomerValidationOk, CustomerValidationErr>({
        behavior: "customer.validation",
        reason: `Customer ${msg.customerId} is not active`,
      });
    }

    return Ok<CustomerValidationOk, CustomerValidationErr>({ behavior: "customer.validation" });
  }
}

/* =============================================================================
 * Messages
 * ============================================================================= */

class CreateOrderMessage implements IMessage, IHasCustomerId {
  public readonly name = "CreateOrder";
  public constructor(public readonly orderId: string, public readonly customerId: number) {}
}

class GetCustomerMessage implements IMessage, IHasCustomerId {
  public readonly name = "GetCustomer";
  public constructor(public readonly customerId: number) {}
}

class PayInvoiceMessage implements IMessage {
  public readonly name = "PayInvoice";
  public constructor(public readonly invoiceId: number) {}
}

/* =============================================================================
 * Handlers (domain Result<T,E> using your functional Result)
 * ============================================================================= */

class CreateOrderHandler
  implements IHandler<CreateOrderMessage, OrderCreated, OrderError>
{
  public constructor(private readonly db: IDatabase) {}
  Handle(query: IQuery<CreateOrderMessage>): Promise<Result<OrderCreated, OrderError>> {
    throw new Error("Method not implemented.");
  }

  public async handle(
    _ctx: IContextPipeline,
    msg: CreateOrderMessage
  ): Promise<Result<OrderCreated, OrderError>> {
    if (!msg.orderId) {
      return Err<OrderCreated, OrderError>({ reason: "Invalid orderId" });
    }

    await this.db.createOrder({ orderId: msg.orderId, customerId: msg.customerId });

    return Ok<OrderCreated, OrderError>({
      orderId: msg.orderId,
      customerId: msg.customerId,
    });
  }
}

class GetCustomerHandler
  implements IHandler<GetCustomerMessage, Customer, CustomerNotFound>
{
  public constructor(private readonly db: IDatabase) {}
  Handle(query: IQuery<GetCustomerMessage>): Promise<Result<Customer, CustomerNotFound>> {
    throw new Error("Method not implemented.");
  }

  public async handle(
    _ctx: IContextPipeline,
    msg: GetCustomerMessage
  ): Promise<Result<Customer, CustomerNotFound>> {
    const customer = await this.db.getCustomer(msg.customerId);
    if (!customer) return Err<Customer, CustomerNotFound>({ reason: "Customer not found" });

    return Ok<Customer, CustomerNotFound>(customer);
  }
}

class PayInvoiceHandler
  implements IHandler<PayInvoiceMessage, Invoice, PaymentFailed>
{
  public constructor(private readonly db: IDatabase) {}
  Handle(query: IQuery<PayInvoiceMessage>): Promise<Result<Invoice, PaymentFailed>> {
    throw new Error("Method not implemented.");
  }

  public async handle(
    _ctx: IContextPipeline,
    msg: PayInvoiceMessage
  ): Promise<Result<Invoice, PaymentFailed>> {
    const inv = await this.db.getInvoice(msg.invoiceId);
    if (!inv) return Err<Invoice, PaymentFailed>({ reason: "Invoice not found" });
    if (inv.paid) return Err<Invoice, PaymentFailed>({ reason: "Invoice already paid" });

    const customer = await this.db.getCustomer(inv.customerId);
    if (!customer) return Err<Invoice, PaymentFailed>({ reason: "Customer not found for invoice" });
    if (!customer.isActive) return Err<Invoice, PaymentFailed>({ reason: "Customer not active" });

    await this.db.markInvoicePaid(inv.invoiceId);

    const updated = await this.db.getInvoice(inv.invoiceId);
    return Ok<Invoice, PaymentFailed>(updated!);
  }
}

/* =============================================================================
 * Fixture (DRY)
 * ============================================================================= */

class DomainFixture {
  public readonly db: FakeDatabase;

  public constructor() {
    this.db = new FakeDatabase()
      .seedCustomer({ id: 1, name: "Alice", isActive: true })
      .seedCustomer({ id: 2, name: "Bob", isActive: false })
      .seedInvoice({ invoiceId: 10, customerId: 1, paid: false })
      .seedInvoice({ invoiceId: 11, customerId: 2, paid: false });
  }

  public ctx(): PipelineContext {
    return new PipelineContext();
  }

  public mediatorForOrder(): Mediator<CreateOrderMessage, Result<OrderCreated, OrderError>> {
    const behaviors: ReadonlyArray<IBehavior<CreateOrderMessage, IBehaviorResult, IBehaviorResult>> = [
      new CustomerValidationBehavior<CreateOrderMessage>(this.db) as unknown as IBehavior<
        CreateOrderMessage,
        IBehaviorResult,
        IBehaviorResult
      >,
    ];

    const pipeline = new Pipeline<CreateOrderMessage, Result<OrderCreated, OrderError>>(
      behaviors,
      new CreateOrderHandler(this.db)
    );

    return new Mediator(pipeline);
  }

  public mediatorForCustomer(): Mediator<GetCustomerMessage, Result<Customer, CustomerNotFound>> {
    const behaviors: ReadonlyArray<IBehavior<GetCustomerMessage, IBehaviorResult, IBehaviorResult>> = [
      new CustomerValidationBehavior<GetCustomerMessage>(this.db) as unknown as IBehavior<
        GetCustomerMessage,
        IBehaviorResult,
        IBehaviorResult
      >,
    ];

    const pipeline = new Pipeline<GetCustomerMessage, Result<Customer, CustomerNotFound>>(
      behaviors,
      new GetCustomerHandler(this.db)
    );

    return new Mediator(pipeline);
  }

  public mediatorForInvoice(): Mediator<PayInvoiceMessage, Result<Invoice, PaymentFailed>> {
    // For PayInvoiceMessage we *don't* have customerId on the message,
    // so we demonstrate the handler doing the lookup itself (invoice -> customer).
    const behaviors: ReadonlyArray<IBehavior<PayInvoiceMessage, IBehaviorResult, IBehaviorResult>> = [];

    const pipeline = new Pipeline<PayInvoiceMessage, Result<Invoice, PaymentFailed>>(
      behaviors,
      new PayInvoiceHandler(this.db)
    );

    return new Mediator(pipeline);
  }
}

/* =============================================================================
 * Integration tests
 * ============================================================================= */

describe("integration — CustomerValidationBehavior + IDatabase + FakeDatabase", () => {
  it("Result<OrderCreated, OrderError> — valid customer => pipeline Ok(inner Ok) and order stored", async () => {
    const fx = new DomainFixture();
    const mediator = fx.mediatorForOrder();

    const outer = await mediator.send(new CreateOrderMessage("order-1", 1), fx.ctx());

    expect(outer.isOk()).toBe(true);

    const inner = outer.unwrap();
    expect(inner.isOk()).toBe(true);
    expect(inner.unwrap()).toEqual({ orderId: "order-1", customerId: 1 });

    expect(fx.db.orderExists("order-1")).toBe(true);
  });

  it("Result<OrderCreated, OrderError> — inactive customer => pipeline Err (behavior blocks handler)", async () => {
    const fx = new DomainFixture();
    const mediator = fx.mediatorForOrder();

    const outer = await mediator.send(new CreateOrderMessage("order-2", 2), fx.ctx());

    expect(outer.isErr()).toBe(true);

    const e = outer.unwrapErr() as any;
    expect(e.behavior).toBe("customer.validation");
    expect(String(e.reason)).toContain("not active");

    expect(fx.db.orderExists("order-2")).toBe(false);
  });

  it("Result<Customer, CustomerNotFound> — valid customer => pipeline Ok(inner Ok)", async () => {
    const fx = new DomainFixture();
    const mediator = fx.mediatorForCustomer();

    const outer = await mediator.send(new GetCustomerMessage(1), fx.ctx());

    expect(outer.isOk()).toBe(true);

    const inner = outer.unwrap();
    expect(inner.isOk()).toBe(true);
    expect(inner.unwrap()).toEqual({ id: 1, name: "Alice", isActive: true });
  });

  it("Result<Customer, CustomerNotFound> — missing customer => pipeline Err (behavior blocks handler)", async () => {
    const fx = new DomainFixture();
    const mediator = fx.mediatorForCustomer();

    const outer = await mediator.send(new GetCustomerMessage(999), fx.ctx());

    expect(outer.isErr()).toBe(true);

    const e = outer.unwrapErr() as any;
    expect(e.behavior).toBe("customer.validation");
    expect(String(e.reason)).toContain("not found");
  });

  it("Result<Invoice, PaymentFailed> — pay invoice => pipeline Ok(inner Ok) and invoice becomes paid", async () => {
    const fx = new DomainFixture();
    const mediator = fx.mediatorForInvoice();

    const outer = await mediator.send(new PayInvoiceMessage(10), fx.ctx());

    expect(outer.isOk()).toBe(true);

    const inner = outer.unwrap();
    expect(inner.isOk()).toBe(true);

    const inv = inner.unwrap();
    expect(inv.invoiceId).toBe(10);
    expect(inv.customerId).toBe(1);
    expect(inv.paid).toBe(true);

    expect(fx.db.invoicePaid(10)).toBe(true);
  });

  it("Result<Invoice, PaymentFailed> — invoice for inactive customer => pipeline Ok(inner Err)", async () => {
    const fx = new DomainFixture();
    const mediator = fx.mediatorForInvoice();

    const outer = await mediator.send(new PayInvoiceMessage(11), fx.ctx());

    expect(outer.isOk()).toBe(true);

    const inner = outer.unwrap();
    expect(inner.isErr()).toBe(true);

    expect(inner.unwrapErr()).toEqual({ reason: "Customer not active" });
    expect(fx.db.invoicePaid(11)).toBe(false);
  });
});