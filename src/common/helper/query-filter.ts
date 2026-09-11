import { BadRequestException } from '@nestjs/common';
import { Model, QueryFilter, SchemaType } from 'mongoose';
import { queryConditions, queryObj } from './common-types';

type querySchemaType = SchemaType & {
  instance?: string;
  options?: { ref?: string; select?: boolean };
  // an array of refs keeps the ref on its element type
  embeddedSchemaType?: { options?: { ref?: string } };
};

/**
 * Turns the query parsed by the QueryMiddleware into a mongoose filter:
 * regular fields are used as they are, a reference query is resolved to the ids of the
 * matching referenced documents and `search` becomes a case insensitive $or over the text fields.
 */
export async function buildQueryFilter<T>(
  model: Model<T>,
  queryObj?: queryObj,
): Promise<QueryFilter<T>> {
  const filter: Record<string, unknown> = { ...queryObj?.regular };

  for (const [reference, { paths, value }] of Object.entries(
    queryObj?.references ?? {},
  )) {
    filter[reference] = {
      $in: await findReferenceIds(model, reference, paths, value),
    };
  }

  const searchable = queryObj?.search ? searchableFields(model) : [];
  if (searchable.length) {
    filter.$or = searchable.map((field) => ({
      [field]: { $regex: escapeRegExp(queryObj.search), $options: 'i' },
    }));
  }

  return filter as QueryFilter<T>;
}

async function findReferenceIds<T>(
  model: Model<T>,
  reference: string,
  paths: string[],
  value: queryConditions,
) {
  const path = model.schema.path(reference) as querySchemaType;
  const ref = path?.options?.ref ?? path?.embeddedSchemaType?.options?.ref;

  if (!ref) {
    throw new BadRequestException(`'${reference}' is not a reference`);
  }

  return model.db.model(ref).distinct('_id', { [paths.join('.')]: value });
}

// every String field of the model, except the ones hidden with `select: false`
function searchableFields<T>(model: Model<T>): string[] {
  return Object.entries(model.schema.paths as Record<string, querySchemaType>)
    .filter(
      ([, path]) =>
        path.instance === 'String' && path.options?.select !== false,
    )
    .map(([field]) => field);
}

// a search term is a literal, not a pattern
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
