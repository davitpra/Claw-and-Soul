"use client";

import { useState } from "react";
import {
  Button,
  Text,
  InlineStack,
  BlockStack,
  Divider,
  Collapsible,
  TextField,
} from "@shopify/polaris";
import { adminApi, OrderExpenses } from "@/entities/admin/api";
import { fmtCurrency } from "@/entities/admin/lib/order-format";

// Etiquetas locales: el detalle de pedido usa una redacción propia
// ("Producción (Pictorem)", "Agrandar imagen") distinta de la lista compartida
// en `entities/admin/expense-labels`. Se mantiene aquí para no alterar la UI.
const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  pod_production: "Producción (Pictorem)",
  image_generation: "Generación de imagen",
  image_upscale: "Agrandar imagen",
  manual: "Manual",
};

type OrderExpensesSectionProps = {
  orderId: string;
};

export function OrderExpensesSection({ orderId }: OrderExpensesSectionProps) {
  const [orderExpenses, setOrderExpenses] = useState<OrderExpenses | null>(null);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [showExpenses, setShowExpenses] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCurrency, setNewExpenseCurrency] = useState("CAD");
  const [newExpenseNote, setNewExpenseNote] = useState("");
  const [savingExpense, setSavingExpense] = useState(false);

  async function loadExpenses() {
    setLoadingExpenses(true);
    try {
      const data = await adminApi.orders.expenses(orderId);
      setOrderExpenses(data);
      setShowExpenses(true);
    } finally {
      setLoadingExpenses(false);
    }
  }

  async function handleSaveExpense() {
    const amount = parseFloat(newExpenseAmount);
    if (isNaN(amount) || amount <= 0) return;
    setSavingExpense(true);
    try {
      await adminApi.orders.addExpense(orderId, {
        amount,
        currency: newExpenseCurrency,
        note: newExpenseNote || undefined,
      });
      setNewExpenseAmount("");
      setNewExpenseNote("");
      setAddingExpense(false);
      await loadExpenses();
    } finally {
      setSavingExpense(false);
    }
  }

  async function handleDeleteExpense(expenseId: string) {
    await adminApi.orders.deleteExpense(expenseId);
    await loadExpenses();
  }

  return (
    <BlockStack gap="200">
      <InlineStack align="space-between" blockAlign="center">
        <Text as="span" variant="headingSm">
          Gastos del pedido
        </Text>
        <Button
          variant="plain"
          size="slim"
          loading={loadingExpenses}
          onClick={
            showExpenses ? () => setShowExpenses(false) : loadExpenses
          }
        >
          {showExpenses ? "Ocultar" : "Ver gastos"}
        </Button>
      </InlineStack>
      <Collapsible open={showExpenses} id="order-expenses-collapsible">
        <BlockStack gap="200">
          {orderExpenses && orderExpenses.items.length === 0 && (
            <Text as="p" tone="subdued">
              Sin gastos registrados aún.
            </Text>
          )}
          {orderExpenses && orderExpenses.items.length > 0 && (
            <>
              {Object.entries(orderExpenses.summary).map(
                ([cat, { count, totalBase }]) => (
                  <InlineStack
                    key={cat}
                    align="space-between"
                    blockAlign="center"
                  >
                    <Text as="span" tone="subdued">
                      {EXPENSE_CATEGORY_LABELS[cat] ?? cat}
                      {count > 1 && ` (${count})`}
                    </Text>
                    <Text as="span">
                      ≈ {fmtCurrency(totalBase, orderExpenses.baseCurrency)}
                    </Text>
                  </InlineStack>
                ),
              )}
              <Divider />
              <InlineStack align="space-between" blockAlign="center">
                <Text as="span" fontWeight="semibold">
                  Total gastos
                </Text>
                <Text as="span" fontWeight="semibold">
                  ≈{" "}
                  {fmtCurrency(
                    orderExpenses.grandTotal,
                    orderExpenses.baseCurrency,
                  )}
                </Text>
              </InlineStack>
              <BlockStack gap="100">
                {orderExpenses.items.map((exp) => (
                  <InlineStack
                    key={exp.id}
                    align="space-between"
                    blockAlign="center"
                    gap="100"
                  >
                    <BlockStack gap="0">
                      <Text as="span" variant="bodySm" tone="subdued">
                        {EXPENSE_CATEGORY_LABELS[exp.category] ?? exp.category}
                        {exp.note && ` · ${exp.note}`}
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {new Date(exp.createdAt).toLocaleDateString("es-ES")}
                        {exp.provider && ` · ${exp.provider}`}
                      </Text>
                    </BlockStack>
                    <InlineStack gap="100" blockAlign="center">
                      <Text as="span" variant="bodySm">
                        {fmtCurrency(exp.amount, exp.currency)}
                        {exp.amountBase !== null &&
                          exp.baseCurrency !== exp.currency && (
                            <Text as="span" variant="bodySm" tone="subdued">
                              {" "}
                              ≈ {fmtCurrency(exp.amountBase, exp.baseCurrency!)}
                            </Text>
                          )}
                      </Text>
                      {exp.source === "admin" && (
                        <Button
                          variant="plain"
                          size="slim"
                          tone="critical"
                          onClick={() => handleDeleteExpense(exp.id)}
                        >
                          ✕
                        </Button>
                      )}
                    </InlineStack>
                  </InlineStack>
                ))}
              </BlockStack>
            </>
          )}
          {addingExpense ? (
            <BlockStack gap="200">
              <InlineStack gap="200" blockAlign="end">
                <div style={{ flex: 1 }}>
                  <TextField
                    label="Monto"
                    type="number"
                    value={newExpenseAmount}
                    onChange={setNewExpenseAmount}
                    autoComplete="off"
                  />
                </div>
                <div style={{ width: 80 }}>
                  <TextField
                    label="Moneda"
                    value={newExpenseCurrency}
                    onChange={setNewExpenseCurrency}
                    autoComplete="off"
                  />
                </div>
              </InlineStack>
              <TextField
                label="Nota"
                value={newExpenseNote}
                onChange={setNewExpenseNote}
                autoComplete="off"
              />
              <InlineStack gap="200">
                <Button
                  variant="primary"
                  size="slim"
                  loading={savingExpense}
                  onClick={handleSaveExpense}
                >
                  Guardar gasto
                </Button>
                <Button
                  variant="plain"
                  size="slim"
                  onClick={() => setAddingExpense(false)}
                >
                  Cancelar
                </Button>
              </InlineStack>
            </BlockStack>
          ) : (
            showExpenses && (
              <Button
                variant="plain"
                size="slim"
                onClick={() => setAddingExpense(true)}
              >
                + Agregar gasto manual
              </Button>
            )
          )}
        </BlockStack>
      </Collapsible>
    </BlockStack>
  );
}
