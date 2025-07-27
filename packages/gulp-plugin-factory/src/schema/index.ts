import { z } from "zod";

import { fileVinylSchema, transformStreamSchema } from "@/shared/schemas";

// Schema for onFile function
export const onFileSchema = z.function()
  .args(fileVinylSchema, z.string(), transformStreamSchema)
  .returns(z.promise(z.union([fileVinylSchema, z.void()])));

// Schema for onFinish function
export const onFinishSchema = z.function()
  .args(transformStreamSchema)
  .returns(z.promise(z.void()));

// Main plugin options schema
export const pluginFactoryOptionsSchema = z.object({
  onFile: onFileSchema,
  onFinish: onFinishSchema.optional(),
  pluginName: z.string().min(5),
}).strict();

// Defining the type for the options PluginFactory.
export type PluginFactoryOptions = z.infer<typeof pluginFactoryOptionsSchema>;
