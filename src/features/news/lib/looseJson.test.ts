import { describe, expect, it } from "vitest";

import { parseJsonLoose } from "./looseJson";

describe("parseJsonLoose", () => {
  it("parses raw JSON", () => {
    expect(parseJsonLoose('{"a":1}')).toEqual({ a: 1 });
  });

  it("parses a ```json fenced block", () => {
    const text = 'Here is the result:\n```json\n{"a":1}\n```\n';

    expect(parseJsonLoose(text)).toEqual({ a: 1 });
  });

  it("parses a bare ``` fenced block without the json tag", () => {
    const text = '```\n{"a":1}\n```';

    expect(parseJsonLoose(text)).toEqual({ a: 1 });
  });

  it("extracts a JSON object embedded in surrounding prose", () => {
    expect(parseJsonLoose('Sure! {"a":1} Hope that helps.')).toEqual({ a: 1 });
  });

  it("throws the intended error when no JSON object is present", () => {
    expect(() => parseJsonLoose("no json here")).toThrow("no JSON object found in response");
  });

  it("throws the intended error instead of a TypeError on null input", () => {
    expect(() => parseJsonLoose(null)).toThrow("no JSON object found in response");
  });

  it("throws the intended error on undefined input", () => {
    expect(() => parseJsonLoose(undefined)).toThrow("no JSON object found in response");
  });

  it("throws the intended error on empty string", () => {
    expect(() => parseJsonLoose("")).toThrow("no JSON object found in response");
  });

  it("propagates a parse error when the brace-slice is malformed JSON", () => {
    expect(() => parseJsonLoose("prefix {not valid} suffix")).toThrow();
  });
});
