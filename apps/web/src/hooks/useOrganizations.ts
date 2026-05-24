import { useState, useEffect, useCallback } from 'react';
import { Organization } from '../types';
import { organizationService } from '../services/organizationService';

export const useOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationService.getAll();
      setOrganizations(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return { organizations, loading, error, refresh: fetchOrganizations };
};

export const useOrganization = (id: string | null) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await organizationService.getById(id);
      setOrganization(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch organization');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  return { organization, loading, error, refresh: fetchOrganization };
};

export const useAdminOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await organizationService.getAdminAll();
      setOrganizations(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  return { organizations, loading, error, refresh: fetchOrganizations };
};

export const useAdminOrganization = (id: string | null) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganization = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await organizationService.getAdminById(id);
      setOrganization(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch organization');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  return { organization, loading, error, refresh: fetchOrganization };
};
