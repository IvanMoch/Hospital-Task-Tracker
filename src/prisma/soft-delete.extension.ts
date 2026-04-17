import { Prisma } from '../../generated/prisma/client';

const READ_OPS = new Set([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
  'groupBy',
]);

const toModelKey = (model: string) =>
  model.charAt(0).toLowerCase() + model.slice(1);

export const softDeleteExtension = Prisma.defineExtension((client) =>
  client.$extends({
    name: 'softDelete',
    query: {
      // Cast required until the first Prisma model is added — TypeMap resolves to `never`
      // on an empty schema, making the callback return type `Promise<never>`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      $allModels: ({
        async $allOperations({ operation, model, args, query }: any): Promise<any> {
          const key = toModelKey(model);

          if (operation === 'delete') {
            return (client as any)[key].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }

          if (operation === 'deleteMany') {
            return (client as any)[key].updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }

          if (READ_OPS.has(operation)) {
            args.where = { deletedAt: null, ...(args.where ?? {}) };
          }

          return query(args);
        },
      } as any),
    },
  }),
);
