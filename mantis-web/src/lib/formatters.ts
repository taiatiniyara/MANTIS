const currencyFormatter = new Intl.NumberFormat("en-FJ", {
  style: "currency",
  currency: "FJD",
  minimumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat("en-US")

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-FJ", {
  dateStyle: "medium",
  timeStyle: "short",
})

export const formatCurrency = (value: number | null | undefined) =>
  currencyFormatter.format(value ?? 0)

export const formatNumber = (value: number | null | undefined) =>
  numberFormatter.format(value ?? 0)

export const formatPercent = (value: number) => percentFormatter.format(value)

export const formatDateTime = (value: string | Date | null | undefined) => {
  if (!value) {
    return "—"
  }

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "—"
  }

  return dateTimeFormatter.format(date)
}
