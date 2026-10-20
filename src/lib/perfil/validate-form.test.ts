import { test } from "node:test";
import assert from "node:assert/strict";
import { firstInvalidField, validateProfileForm, type ProfileFormValues } from "./validate-form";

const YEAR = 2026;
const valid: ProfileFormValues = {
  fullName: "Lucía Fernández",
  affiliation: "UDESA",
  institution: "",
  role: "STUDENT",
  otherRole: "",
  studentStatus: "STUDYING",
  careers: ["ingenieria-ia"],
  otherCareer: "",
  startYear: "2024",
  consent: true,
};

test("un perfil completo no tiene errores", () => {
  assert.deepEqual(validateProfileForm(valid, YEAR), {});
});

test("el formulario vacío marca los campos que siempre se piden y el primero es el nombre", () => {
  const empty: ProfileFormValues = { ...valid, fullName: "", affiliation: "", role: "", studentStatus: "", careers: [], startYear: "", consent: false };
  const errors = validateProfileForm(empty, YEAR);
  assert.deepEqual(Object.keys(errors).sort(), ["affiliation", "consent", "fullName", "role"]);
  assert.equal(firstInvalidField(errors), "fullName");
});

test("el nombre necesita nombre y apellido", () => {
  assert.equal(validateProfileForm({ ...valid, fullName: "Lucía" }, YEAR).fullName, "Escribí tu nombre y apellido.");
  assert.equal(validateProfileForm({ ...valid, fullName: "  Lucía   Fernández " }, YEAR).fullName, undefined);
});

test("trabajo y otra universidad piden la institución, con su mensaje", () => {
  const work = validateProfileForm({ ...valid, affiliation: "WORK", careers: [], otherCareer: "Electrónica" }, YEAR);
  assert.equal(work.institution, "Contanos en qué empresa o lugar trabajás.");
  const uni = validateProfileForm({ ...valid, affiliation: "OTHER_UNIVERSITY", careers: [], otherCareer: "Electrónica" }, YEAR);
  assert.equal(uni.institution, "Contanos de qué universidad sos.");
  assert.equal(validateProfileForm({ ...valid, affiliation: "INDEPENDENT", careers: [], otherCareer: "Electrónica" }, YEAR).institution, undefined);
});

test("estudiante de UdeSA: carrera, 'otra' con detalle, estado y año", () => {
  assert.equal(validateProfileForm({ ...valid, careers: [] }, YEAR).careers, "Elegí al menos una carrera.");
  assert.equal(validateProfileForm({ ...valid, careers: ["otra"] }, YEAR).otherCareer, "Contanos qué carrera estás cursando.");
  assert.equal(validateProfileForm({ ...valid, studentStatus: "" }, YEAR).studentStatus, "Decinos si estás cursando actualmente o ya te recibiste.");
  assert.equal(validateProfileForm({ ...valid, startYear: "" }, YEAR).startYear, "Elegí el año en que empezaste la carrera.");
  assert.ok(validateProfileForm({ ...valid, startYear: "1980" }, YEAR).startYear);
  assert.ok(validateProfileForm({ ...valid, startYear: "2027" }, YEAR).startYear);
  // Ya recibido/a: no se pide el año.
  assert.deepEqual(validateProfileForm({ ...valid, studentStatus: "GRADUATED", startYear: "" }, YEAR), {});
});

test("estudiante de afuera: la carrera va como texto libre", () => {
  const base = { ...valid, affiliation: "INDEPENDENT", careers: [] };
  assert.equal(validateProfileForm(base, YEAR).otherCareer, "Contanos qué carrera estudiás.");
  assert.deepEqual(validateProfileForm({ ...base, otherCareer: "Física" }, YEAR), {});
});

test("profesor y otro: ni carrera ni año; 'otro' pide el rol", () => {
  assert.deepEqual(validateProfileForm({ ...valid, role: "PROFESSOR", studentStatus: "", careers: [], startYear: "" }, YEAR), {});
  assert.equal(validateProfileForm({ ...valid, role: "OTHER", studentStatus: "", careers: [], startYear: "" }, YEAR).otherRole, "Contanos qué rol tenés.");
});
