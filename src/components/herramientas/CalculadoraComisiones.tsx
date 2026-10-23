"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/components/analytics/tracking";
import {
  IVA_RATE,
  PROVIDERS,
  amountBucket,
  computeFee,
  findProvider,
  formatArs,
  formatRate,
} from "@/lib/comisiones-cobro";
import styles from "./calculadora.module.css";

const DEFAULT_AMOUNT = 100000;

function parseAmount(raw: string) {
  const digits = raw.replace(/[^\d,]/g, "").replace(",", ".");
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function CalculadoraComisiones() {
  const [rawAmount, setRawAmount] = useState(DEFAULT_AMOUNT.toLocaleString("es-AR"));
  const [providerId, setProviderId] = useState<string>("mercadopago");
  const provider = findProvider(providerId);
  const [methodId, setMethodId] = useState(provider.methods[0].id);
  const method = provider.methods.find((m) => m.id === methodId) ?? provider.methods[0];
  const [termId, setTermId] = useState(method.terms[0].id);
  const term = method.terms.find((t) => t.id === termId) ?? method.terms[0];

  const amount = parseAmount(rawAmount);
  const result = useMemo(() => (term.rate === null || amount <= 0 ? null : computeFee(amount, term.rate)), [amount, term.rate]);

  // GA4: un evento por combinación distinta, tras 900 ms sin cambios; nunca en la carga inicial ni con el monto exacto.
  const [interactions, setInteractions] = useState(0);
  const touch = () => setInteractions((n) => n + 1);
  const lastSent = useRef("");
  useEffect(() => {
    if (interactions === 0) return;
    const payload = {
      tool: "comisiones_cobro",
      provider: provider.id,
      payment_method: method.id,
      term: term.id,
      amount_bucket: amountBucket(amount),
      has_public_rate: term.rate !== null,
    };
    const key = JSON.stringify(payload);
    if (key === lastSent.current) return;
    const timer = window.setTimeout(() => {
      lastSent.current = key;
      trackEvent("calculator_use", payload);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [interactions, provider.id, method.id, term.id, term.rate, amount]);

  const onProvider = (id: string) => {
    touch();
    const next = findProvider(id);
    setProviderId(next.id);
    setMethodId(next.methods[0].id);
    setTermId(next.methods[0].terms[0].id);
  };
  const onMethod = (id: string) => {
    touch();
    const next = provider.methods.find((m) => m.id === id) ?? provider.methods[0];
    setMethodId(next.id);
    setTermId(next.terms[0].id);
  };

  return (
    <section className={styles.calc} aria-label="Calculadora de comisiones" data-calculadora="comisiones-cobro">
      <div className={styles.inputs}>
        <label className={styles.field}>
          <span>Monto que cobrás (ARS)</span>
          <input
            inputMode="decimal"
            value={rawAmount}
            onChange={(e) => {
              touch();
              setRawAmount(e.target.value);
            }}
            onBlur={() => amount > 0 && setRawAmount(amount.toLocaleString("es-AR"))}
            aria-describedby="calc-monto-ayuda"
            name="monto"
          />
          <small id="calc-monto-ayuda">Precio final que paga tu cliente, IVA incluido.</small>
        </label>

        <fieldset className={styles.providers}>
          <legend>Con qué cobrás</legend>
          {PROVIDERS.map((p) => (
            <button
              type="button"
              key={p.id}
              aria-pressed={p.id === provider.id}
              onClick={() => onProvider(p.id)}
              data-provider={p.id}
            >
              {p.name}
            </button>
          ))}
        </fieldset>

        <label className={styles.field}>
          <span>Medio de cobro</span>
          <select value={method.id} onChange={(e) => onMethod(e.target.value)} name="medio">
            {provider.methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Plazo de acreditación</span>
          <select
            value={term.id}
            onChange={(e) => {
              touch();
              setTermId(e.target.value);
            }}
            disabled={method.terms.length < 2}
            name="plazo"
          >
            {method.terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
                {t.rate !== null ? ` (${formatRate(t.rate)} + IVA)` : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.output} aria-live="polite" data-calc-output>
        {result ? (
          <>
            <p className={styles.kicker}>
              {provider.name} · {method.label} · {term.label}
            </p>
            <dl>
              <div>
                <dt>Comisión ({formatRate(result.rate)})</dt>
                <dd data-calc="comision">{formatArs(result.commission)}</dd>
              </div>
              <div>
                <dt>IVA {IVA_RATE}% sobre la comisión</dt>
                <dd data-calc="iva">{formatArs(result.iva)}</dd>
              </div>
              <div>
                <dt>Total que te descuentan</dt>
                <dd data-calc="total">{formatArs(result.total)}</dd>
              </div>
              <div className={styles.net}>
                <dt>Te llega</dt>
                <dd data-calc="neto">{formatArs(result.net)}</dd>
              </div>
            </dl>
          </>
        ) : term.rate === null ? (
          <>
            <p className={styles.kicker}>{provider.name} · {method.label}</p>
            <p className={styles.noRate} data-calc="sin-tarifa">Sin tarifa pública</p>
            <p className={styles.noRateBody}>
              No estimamos números que el proveedor no publica. Pedí la tasa por escrito, con plazo e IVA, y cargala contra la
              de Mercado Pago o Mobbex para comparar.
            </p>
          </>
        ) : (
          <p className={styles.noRateBody}>Ingresá un monto mayor a cero.</p>
        )}
        <p className={styles.note}>
          {provider.note}{" "}
          <a href={provider.source.url} target="_blank" rel="nofollow noopener">
            Ver tarifa oficial
          </a>
          . No incluye retenciones impositivas, cuotas sin interés ni contracargos.
        </p>
      </div>
    </section>
  );
}
