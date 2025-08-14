import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useSyncOrders = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post('http://localhost:3838/api/orders');
      return data;
    },
    onSuccess: async () => {
      // Refresh all contribution-margin queries (any start/end/app)
      await qc.invalidateQueries({ queryKey: ['contribution-margin'] });
    },
  });
};
