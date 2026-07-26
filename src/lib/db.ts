import { supabase } from './supabase';
import type {
  SiteConfig, Service, PortfolioItem, Testimonial,
  Project, ProjectInput,
} from '../types';
import { DEFAULT_CONFIG } from '../types';

export const db = {
  // ---- Site Config ----
  async getConfig(): Promise<SiteConfig> {
    const { data, error } = await supabase.from('site_config').select('*').limit(1).maybeSingle();
    if (error) throw error;
    return data ?? DEFAULT_CONFIG;
  },

  async updateConfig(config: Partial<SiteConfig>): Promise<SiteConfig> {
    const { data: existing } = await supabase.from('site_config').select('id').limit(1).maybeSingle();
    if (existing) {
      const { data, error } = await supabase
        .from('site_config')
        .update({ ...config, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase
      .from('site_config')
      .insert({ ...config, single_row: true })
      .select('*')
      .single();
    if (error) throw error;
    return data;
  },

  // ---- Services ----
  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase.from('services').select('*').order('sort_order');
    if (error) throw error;
    return data ?? [];
  },
  async createService(s: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase.from('services').insert(s).select('*').single();
    if (error) throw error;
    return data;
  },
  async updateService(id: string, s: Partial<Service>): Promise<Service> {
    const { data, error } = await supabase.from('services').update(s).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },
  async deleteService(id: string): Promise<void> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  // ---- Portfolio ----
  async getPortfolio(): Promise<PortfolioItem[]> {
    const { data, error } = await supabase.from('portfolio_items').select('*').order('sort_order');
    if (error) throw error;
    return data ?? [];
  },
  async createPortfolioItem(p: Partial<PortfolioItem>): Promise<PortfolioItem> {
    const { data, error } = await supabase.from('portfolio_items').insert(p).select('*').single();
    if (error) throw error;
    return data;
  },
  async updatePortfolioItem(id: string, p: Partial<PortfolioItem>): Promise<PortfolioItem> {
    const { data, error } = await supabase.from('portfolio_items').update(p).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },
  async deletePortfolioItem(id: string): Promise<void> {
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
    if (error) throw error;
  },

  // ---- Testimonials ----
  async getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase.from('testimonials').select('*').order('sort_order');
    if (error) throw error;
    return data ?? [];
  },
  async createTestimonial(t: Partial<Testimonial>): Promise<Testimonial> {
    const { data, error } = await supabase.from('testimonials').insert(t).select('*').single();
    if (error) throw error;
    return data;
  },
  async updateTestimonial(id: string, t: Partial<Testimonial>): Promise<Testimonial> {
    const { data, error } = await supabase.from('testimonials').update(t).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },
  async deleteTestimonial(id: string): Promise<void> {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
  },

  // ---- Projects ----
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
  async createProject(p: ProjectInput): Promise<Project> {
    const { data, error } = await supabase.from('projects').insert(p).select('*').single();
    if (error) throw error;
    return data;
  },
  async updateProjectStatus(id: string, status: string): Promise<Project> {
    const { data, error } = await supabase.from('projects').update({ status }).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },
};
