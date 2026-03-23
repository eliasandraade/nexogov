"use client"

export function PrintActions() {
  return (
    <div className="print:hidden p-4 flex gap-3 bg-gray-100 border-b">
      <button
        onClick={() => window.print()}
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium"
      >
        Imprimir
      </button>
      <button
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium"
      >
        Voltar
      </button>
    </div>
  )
}
