import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'

export const OrdersCollection: CollectionOverride = ({ defaultCollection }) => ({
    ...defaultCollection,
    admin: {
        ...defaultCollection.admin,
        group: 'Продажи',
    },
    labels: {
        plural: 'Заказы',
        singular: 'Заказ',
    },
})

export const CartsCollection: CollectionOverride = ({ defaultCollection }) => ({
    ...defaultCollection,
    admin: {
        ...defaultCollection.admin,
        group: 'Продажи',
    },
    labels: {
        plural: 'Корзины',
        singular: 'Корзина',
    },
})

export const AddressesCollection: CollectionOverride = ({ defaultCollection }) => ({
    ...defaultCollection,
    admin: {
        ...defaultCollection.admin,
        group: 'Пользователи',
    },
    labels: {
        plural: 'Адреса',
        singular: 'Адрес',
    },
})

export const VariantsCollection: CollectionOverride = ({ defaultCollection }) => ({
    ...defaultCollection,
    admin: {
        ...defaultCollection.admin,
        group: 'Каталог',
    },
    labels: {
        plural: 'Варианты',
        singular: 'Вариант',
    },
})

export const VariantTypesCollection: CollectionOverride = ({ defaultCollection }) => ({
    ...defaultCollection,
    admin: {
        ...defaultCollection.admin,
        group: 'Каталог',
    },
    labels: {
        plural: 'Типы вариантов',
        singular: 'Тип варианта',
    },
})

export const VariantOptionsCollection: CollectionOverride = ({ defaultCollection }) => ({
    ...defaultCollection,
    admin: {
        ...defaultCollection.admin,
        group: 'Каталог',
    },
    labels: {
        plural: 'Опции вариантов',
        singular: 'Опция варианта',
    },
})

export const TransactionsCollection: CollectionOverride = ({ defaultCollection }) => ({
    ...defaultCollection,
    admin: {
        ...defaultCollection.admin,
        group: 'Продажи',
    },
    labels: {
        plural: 'Транзакции',
        singular: 'Транзакция',
    },
})
