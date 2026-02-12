import useSWR from 'swr'
import { 
  fetchDashboardData, 
  fetchPlants, 
  fetchInventory, 
  fetchFinancials, 
  fetchProviders, 
  fetchScenarios,
  type DashboardData,
  type Plant,
  type Inventory,
  type Financial,
  type Provider3PL,
  type Scenario
} from '../utils/api'

const fetcher = <T>(fetchFn: () => Promise<T>) => fetchFn()

export function useDashboardData() {
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(
    'dashboard',
    () => fetcher(fetchDashboardData),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  )
  
  return {
    data,
    isLoading,
    isError: error,
    refresh: mutate
  }
}

export function usePlants() {
  const { data, error, isLoading } = useSWR<Plant[]>(
    'plants',
    () => fetcher(fetchPlants),
    { revalidateOnFocus: false }
  )
  
  return { plants: data || [], isLoading, isError: error }
}

export function useInventory() {
  const { data, error, isLoading } = useSWR<Inventory[]>(
    'inventory',
    () => fetcher(fetchInventory),
    { revalidateOnFocus: false }
  )
  
  return { inventory: data || [], isLoading, isError: error }
}

export function useFinancials() {
  const { data, error, isLoading } = useSWR<Financial[]>(
    'financials',
    () => fetcher(fetchFinancials),
    { revalidateOnFocus: false }
  )
  
  return { financials: data || [], isLoading, isError: error }
}

export function useProviders() {
  const { data, error, isLoading } = useSWR<Provider3PL[]>(
    'providers',
    () => fetcher(fetchProviders),
    { revalidateOnFocus: false }
  )
  
  return { providers: data || [], isLoading, isError: error }
}

export function useScenarios() {
  const { data, error, isLoading, mutate } = useSWR<Scenario[]>(
    'scenarios',
    () => fetcher(fetchScenarios),
    { revalidateOnFocus: false }
  )
  
  return { 
    scenarios: data || [], 
    isLoading, 
    isError: error,
    refresh: mutate
  }
}
