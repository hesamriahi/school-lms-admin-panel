import Settings from "./Settings";
import { User } from "./Types";

interface LoansCalculatorResponse {
  amount: number;
  paid_user_amount: number;
  commission_amount: number;
  insurance_amount: number;
  other_reduces_amount: number;
  installments_count: number;
  installment_amount: number;
}


class Loans {
  public static calculatorForUser(user: User, loanType: string, newAmount?: string): LoansCalculatorResponse {
    let amount = newAmount ? parseInt(newAmount) : user.balance * Settings.getByName('loan_capital_ratio');
    // we don't want to round the amount if admin entered the a new amount.
    if (!newAmount)
      amount = Math.floor(amount / Settings.getByName('loan_rounding_amount')) * Settings.getByName('loan_rounding_amount');
    amount = Math.min(amount, Settings.getByName('loan_max_amount'))

    if (loanType === 'assistance')
      amount = Settings.getByName('assistance_loan_max_amount');

    const commissionAmount = (amount * Settings.getByName('loan_commission_percentage')) / 100;
    const installmentsCount = Settings.getByName('loan_installments_count');
    let installmentAmount = (amount / installmentsCount);
    installmentAmount = Math.ceil(installmentAmount / Settings.getByName('installment_rounding_amount')) * Settings.getByName('installment_rounding_amount');

    let insuranceAmount = 0;
    if (Settings.getByName('insurance_requirement') == 1 && Settings.getByName('insurance_capital_ratio') > 0) {
      insuranceAmount = amount * Settings.getByName('insurance_capital_ratio') / 100;
    }
    const debt = (loanType === 'assistance') ? 0 : user.debt;
    const paidUserAmount = amount - commissionAmount - debt - insuranceAmount;

    return {
      amount: amount,
      paid_user_amount: paidUserAmount,
      commission_amount: commissionAmount,
      insurance_amount: insuranceAmount,
      other_reduces_amount: debt,
      installments_count: installmentsCount,
      installment_amount: installmentAmount,
    };
  }
}

export default Loans;
