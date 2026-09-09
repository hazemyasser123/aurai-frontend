import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Legacy accounts-flow routes (/accounts, /accounts/enrich, /contacts, /draft) now
// live inside the Accounts tab of the batch detail page — deep links redirect there.
export const FlowRedirectPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (batchId) {
      navigate(`/batches/${batchId}?tab=accounts`, { replace: true });
    }
  }, [batchId, navigate]);

  return null;
};
