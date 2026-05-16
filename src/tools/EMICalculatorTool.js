import { BaseTool } from "./BaseTool.js";

export class EMICalculatorTool extends BaseTool {
  name() {
    return "calculateEMI";
  }

  description() {
    return `Calculates the monthly EMI for a loan.
            Use when user asks about EMI, monthly payment,
            or loan repayment amount.`;
  }

  parameters() {
    return {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "Loan amount in rupees e.g. 500000 for 5 lakhs",
        },
        annualRate: {
          type: "number",
          description: "Annual interest rate as % e.g. 10 for 10%",
        },
        tenureYears: {
          type: "number",
          description: "Loan tenure in years e.g. 3 for 3 years",
        },
      },
      required: ["principal", "annualRate", "tenureYears"],
    };
  }

  async use({ principal, annualRate, tenureYears }) {
    const monthlyRate = annualRate / 12 / 100;
    const tenureMonths = tenureYears * 12;

    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      tenureMonths,
    };
  }
}