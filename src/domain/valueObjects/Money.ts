export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'COP') {
    if (amount < 0) {
      throw new Error('El monto no puede ser negativo');
    }
    this.amount = amount;
    this.currency = currency;
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('No se pueden sumar montos de diferentes monedas');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  toString(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
    }).format(this.amount);
  }
}
