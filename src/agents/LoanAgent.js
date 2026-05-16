import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateEMI } from "../tools/EMICalculatorTool.js";
import dotenv from "dotenv";
dotenv.config();

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export class LoanAgent {
    constructor() {
        this.name = "LoanAgent";
        this.description = "Handles loan queries, EMI calculations, eligibility";

        this.tools = [
            {
                name: "calculateEMI",
                description: `Calculates the monthly EMI for a loan.
                      Use this whenever user asks about EMI,
                      monthly payment, or loan repayment amount.`,
                parameters: {
                    type: "object",
                    properties: {
                        principal: {
                            type: "number",
                            description: "Loan amount in rupees e.g. 500000 for 5 lakhs",
                        },
                        annualRate: {
                            type: "number",
                            description: "Annual interest rate as percentage e.g. 10 for 10%",
                        },
                        tenureYears: {
                            type: "number",
                            description: "Loan tenure in years e.g. 3 for 3 years",
                        },
                    },
                    required: ["principal", "annualRate", "tenureYears"],
                },
            },
        ];
    }

    async process(userMessage) {
        console.log(`\n🏦 LoanAgent received: "${userMessage}"`);

        const model = client.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: `You are a helpful loan advisor for an Indian fintech company.
                          You help users understand their loans and EMIs.
                          When a user asks about EMI or monthly payment,
                          always use the calculateEMI tool to get exact numbers.
                          Never guess or estimate — always use the tool.
                          Format amounts in Indian style: ₹16,133`,

            // Hand the tool definitions to the AI
            tools: [{ functionDeclarations: this.tools }],
        });

        // Step 1 — Send user message, AI decides if it needs a tool
        const result = await model.generateContent(userMessage);
        const response = result.response;
        console.log("response", JSON.stringify(response));
        // Step 2 — Check if AI wants to call a tool
        const functionCall = response.candidates[0].content.parts.find(
            (part) => part.functionCall
        );

        if (functionCall) {
            const { name, args } = functionCall.functionCall;
            console.log(`\n⚙️  Agent calling tool: ${name}`);
            console.log(`   With args:`, args);

            // Step 3 — Actually run our real function
            let toolResult;
            if (name === "calculateEMI") {
                toolResult = calculateEMI(
                    args.principal,
                    args.annualRate,
                    args.tenureYears
                );
            }

            console.log(`\n📊 Tool result:`, toolResult);

            // Step 4 — Send tool result back to AI for final response
            const finalResult = await model.generateContent({
                contents: [
                    { role: "user", parts: [{ text: userMessage }] },
                    { role: "model", parts: [{ functionCall: functionCall.functionCall }] },
                    {
                        role: "user",
                        parts: [
                            {
                                functionResponse: {
                                    name,
                                    response: toolResult,
                                },
                            },
                        ],
                    },
                ],
            });

            const finalReply = finalResult.response.text();
            console.log(`\n🤖 LoanAgent: ${finalReply}`);
            return finalReply;

        } else {
            // AI answered directly without needing a tool
            const reply = response.text();
            console.log(`\n🤖 LoanAgent: ${reply}`);
            return reply;
        }
    }
}