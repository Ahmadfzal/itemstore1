import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminLoginInput, AdminLoginResult, ErrorResponse, HealthStatus, ListAdminOrdersParams, Order, OrderInput, OrderStatusInput, OrderWithPackage, Package, PackageInput, PackageUpdate, ProofInput, SettingsInput, StoreSettings } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListPackagesUrl: () => string;
/**
 * @summary List all top-up packages
 */
export declare const listPackages: (options?: RequestInit) => Promise<Package[]>;
export declare const getListPackagesQueryKey: () => readonly ["/api/packages"];
export declare const getListPackagesQueryOptions: <TData = Awaited<ReturnType<typeof listPackages>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPackages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listPackages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListPackagesQueryResult = NonNullable<Awaited<ReturnType<typeof listPackages>>>;
export type ListPackagesQueryError = ErrorType<unknown>;
/**
 * @summary List all top-up packages
 */
export declare function useListPackages<TData = Awaited<ReturnType<typeof listPackages>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listPackages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSettingsUrl: () => string;
/**
 * @summary Get public store settings
 */
export declare const getSettings: (options?: RequestInit) => Promise<StoreSettings>;
export declare const getGetSettingsQueryKey: () => readonly ["/api/settings"];
export declare const getGetSettingsQueryOptions: <TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof getSettings>>>;
export type GetSettingsQueryError = ErrorType<unknown>;
/**
 * @summary Get public store settings
 */
export declare function useGetSettings<TData = Awaited<ReturnType<typeof getSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateOrderUrl: () => string;
/**
 * @summary Create a new order
 */
export declare const createOrder: (orderInput: OrderInput, options?: RequestInit) => Promise<Order>;
export declare const getCreateOrderMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export type CreateOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createOrder>>>;
export type CreateOrderMutationBody = BodyType<OrderInput>;
export type CreateOrderMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create a new order
*/
export declare const useCreateOrder: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrder>>, TError, {
        data: BodyType<OrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrder>>, TError, {
    data: BodyType<OrderInput>;
}, TContext>;
export declare const getUploadOrderProofUrl: (id: number) => string;
/**
 * @summary Upload payment proof for an order
 */
export declare const uploadOrderProof: (id: number, proofInput: ProofInput, options?: RequestInit) => Promise<Order>;
export declare const getUploadOrderProofMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadOrderProof>>, TError, {
        id: number;
        data: BodyType<ProofInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof uploadOrderProof>>, TError, {
    id: number;
    data: BodyType<ProofInput>;
}, TContext>;
export type UploadOrderProofMutationResult = NonNullable<Awaited<ReturnType<typeof uploadOrderProof>>>;
export type UploadOrderProofMutationBody = BodyType<ProofInput>;
export type UploadOrderProofMutationError = ErrorType<ErrorResponse>;
/**
* @summary Upload payment proof for an order
*/
export declare const useUploadOrderProof: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof uploadOrderProof>>, TError, {
        id: number;
        data: BodyType<ProofInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof uploadOrderProof>>, TError, {
    id: number;
    data: BodyType<ProofInput>;
}, TContext>;
export declare const getAdminLoginUrl: () => string;
/**
 * @summary Verify admin password
 */
export declare const adminLogin: (adminLoginInput: AdminLoginInput, options?: RequestInit) => Promise<AdminLoginResult>;
export declare const getAdminLoginMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export type AdminLoginMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogin>>>;
export type AdminLoginMutationBody = BodyType<AdminLoginInput>;
export type AdminLoginMutationError = ErrorType<unknown>;
/**
* @summary Verify admin password
*/
export declare const useAdminLogin: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export declare const getUpdateSettingsUrl: () => string;
/**
 * @summary Update store settings (admin)
 */
export declare const updateSettings: (settingsInput: SettingsInput, options?: RequestInit) => Promise<StoreSettings>;
export declare const getUpdateSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SettingsInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SettingsInput>;
}, TContext>;
export type UpdateSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateSettings>>>;
export type UpdateSettingsMutationBody = BodyType<SettingsInput>;
export type UpdateSettingsMutationError = ErrorType<unknown>;
/**
* @summary Update store settings (admin)
*/
export declare const useUpdateSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateSettings>>, TError, {
        data: BodyType<SettingsInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateSettings>>, TError, {
    data: BodyType<SettingsInput>;
}, TContext>;
export declare const getCreatePackageUrl: () => string;
/**
 * @summary Create a new top-up package (admin)
 */
export declare const createPackage: (packageInput: PackageInput, options?: RequestInit) => Promise<Package>;
export declare const getCreatePackageMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPackage>>, TError, {
        data: BodyType<PackageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createPackage>>, TError, {
    data: BodyType<PackageInput>;
}, TContext>;
export type CreatePackageMutationResult = NonNullable<Awaited<ReturnType<typeof createPackage>>>;
export type CreatePackageMutationBody = BodyType<PackageInput>;
export type CreatePackageMutationError = ErrorType<ErrorResponse>;
/**
* @summary Create a new top-up package (admin)
*/
export declare const useCreatePackage: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createPackage>>, TError, {
        data: BodyType<PackageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createPackage>>, TError, {
    data: BodyType<PackageInput>;
}, TContext>;
export declare const getUpdatePackageUrl: (id: number) => string;
/**
 * @summary Update a top-up package (admin)
 */
export declare const updatePackage: (id: number, packageUpdate: PackageUpdate, options?: RequestInit) => Promise<Package>;
export declare const getUpdatePackageMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePackage>>, TError, {
        id: number;
        data: BodyType<PackageUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updatePackage>>, TError, {
    id: number;
    data: BodyType<PackageUpdate>;
}, TContext>;
export type UpdatePackageMutationResult = NonNullable<Awaited<ReturnType<typeof updatePackage>>>;
export type UpdatePackageMutationBody = BodyType<PackageUpdate>;
export type UpdatePackageMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update a top-up package (admin)
*/
export declare const useUpdatePackage: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updatePackage>>, TError, {
        id: number;
        data: BodyType<PackageUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updatePackage>>, TError, {
    id: number;
    data: BodyType<PackageUpdate>;
}, TContext>;
export declare const getDeletePackageUrl: (id: number) => string;
/**
 * @summary Delete a top-up package (admin)
 */
export declare const deletePackage: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeletePackageMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePackage>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deletePackage>>, TError, {
    id: number;
}, TContext>;
export type DeletePackageMutationResult = NonNullable<Awaited<ReturnType<typeof deletePackage>>>;
export type DeletePackageMutationError = ErrorType<ErrorResponse>;
/**
* @summary Delete a top-up package (admin)
*/
export declare const useDeletePackage: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deletePackage>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deletePackage>>, TError, {
    id: number;
}, TContext>;
export declare const getListAdminOrdersUrl: (params?: ListAdminOrdersParams) => string;
/**
 * @summary List all orders (admin)
 */
export declare const listAdminOrders: (params?: ListAdminOrdersParams, options?: RequestInit) => Promise<OrderWithPackage[]>;
export declare const getListAdminOrdersQueryKey: (params?: ListAdminOrdersParams) => readonly ["/api/admin/orders", ...ListAdminOrdersParams[]];
export declare const getListAdminOrdersQueryOptions: <TData = Awaited<ReturnType<typeof listAdminOrders>>, TError = ErrorType<unknown>>(params?: ListAdminOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminOrders>>>;
export type ListAdminOrdersQueryError = ErrorType<unknown>;
/**
 * @summary List all orders (admin)
 */
export declare function useListAdminOrders<TData = Awaited<ReturnType<typeof listAdminOrders>>, TError = ErrorType<unknown>>(params?: ListAdminOrdersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateOrderStatusUrl: (id: number) => string;
/**
 * @summary Update order status (admin)
 */
export declare const updateOrderStatus: (id: number, orderStatusInput: OrderStatusInput, options?: RequestInit) => Promise<Order>;
export declare const getUpdateOrderStatusMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        id: number;
        data: BodyType<OrderStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<OrderStatusInput>;
}, TContext>;
export type UpdateOrderStatusMutationResult = NonNullable<Awaited<ReturnType<typeof updateOrderStatus>>>;
export type UpdateOrderStatusMutationBody = BodyType<OrderStatusInput>;
export type UpdateOrderStatusMutationError = ErrorType<ErrorResponse>;
/**
* @summary Update order status (admin)
*/
export declare const useUpdateOrderStatus: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
        id: number;
        data: BodyType<OrderStatusInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrderStatus>>, TError, {
    id: number;
    data: BodyType<OrderStatusInput>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map