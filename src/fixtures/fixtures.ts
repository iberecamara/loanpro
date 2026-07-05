import { mergeExpects, mergeTests } from "playwright/test";
import { test as apis } from "@fixtures/api.fixtures";
import { test as logging } from "@fixtures/logging.fixtures";
import { test as steps } from "@fixtures/steps.fixtures";
import { expect as matchers } from "@fixtures/matchers.fixtures";

export const test = mergeTests(apis, logging, steps);
export const expect = mergeExpects(matchers);
