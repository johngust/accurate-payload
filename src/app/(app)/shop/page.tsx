import { FiltersSidebar } from '@/components/FiltersSidebar'
import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const metadata = {
  description: 'Search for products in the store.',
  title: 'Shop',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category } = await searchParams
  const payload = await getPayload({ config: configPromise })

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInUSD: true,
    },
    ...(sort ? { sort } : { sort: 'title' }),
    ...(searchValue || category
      ? {
        where: {
          and: [
            {
              _status: {
                equals: 'published',
              },
            },
            ...(searchValue
              ? [
                {
                  or: [
                    {
                      title: {
                        like: searchValue,
                      },
                    },
                    {
                      description: {
                        like: searchValue,
                      },
                    },
                  ],
                },
              ]
              : []),
            ...(category
              ? [
                {
                  categories: {
                    contains: category,
                  },
                },
              ]
              : []),
          ],
        },
      }
      : {}),
  })

  const resultsText = products.docs.length > 1 ? 'результатов' : 'результат'

  return (
    <div className="container py-8 flex flex-col md:flex-row gap-8">
      <aside className="w-full shrink-0 md:w-1/4">
        <FiltersSidebar />
      </aside>
      <main className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Каталог товаров</h1>
        </div>

        {searchValue ? (
          <p className="mb-4 text-muted-foreground">
            {products.docs?.length === 0
              ? 'По запросу ничего не найдено '
              : `Показано ${products.docs.length} ${resultsText} по запросу `}
            <span className="font-bold text-foreground">&quot;{searchValue}&quot;</span>
          </p>
        ) : null}

        {!searchValue && products.docs?.length === 0 && (
          <p className="mb-4 text-muted-foreground">Товары не найдены. Попробуйте изменить фильтры.</p>
        )}

        {products?.docs.length > 0 ? (
          <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.docs.map((product) => {
              return <ProductGridItem key={product.id} product={product} />
            })}
          </Grid>
        ) : null}
      </main>
    </div>
  )
}

