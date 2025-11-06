-- RPC Function: get_company_analytics
CREATE OR REPLACE FUNCTION public.get_company_analytics(
    p_company_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_projects INTEGER,
    active_projects INTEGER,
    completed_projects INTEGER,
    total_revenue NUMERIC,
    monthly_revenue NUMERIC,
    team_productivity NUMERIC,
    completion_rate NUMERIC,
    budget_utilization NUMERIC,
    month TEXT,
    year INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.total_projects,
        ca.active_projects,
        ca.completed_projects,
        ca.total_revenue,
        ca.monthly_revenue,
        ca.team_productivity,
        ca.completion_rate,
        ca.budget_utilization,
        ca.month,
        ca.year
    FROM public.company_analytics ca
    WHERE ca.company_id = p_company_id
    AND (p_start_date IS NULL OR (ca.year || '-' || LPAD(ca.month, 2, '0') || '-01')::DATE >= p_start_date)
    AND (p_end_date IS NULL OR (ca.year || '-' || LPAD(ca.month, 2, '0') || '-01')::DATE <= p_end_date)
    ORDER BY ca.year DESC, ca.month DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: create_api_key
CREATE OR REPLACE FUNCTION public.create_api_key(
    p_company_id UUID,
    p_key_name TEXT,
    p_key_value TEXT
)
RETURNS JSON AS $$
DECLARE
    v_api_key_id UUID;
BEGIN
    INSERT INTO public.api_keys (company_id, name, key_value)
    VALUES (p_company_id, p_key_name, p_key_value)
    RETURNING id INTO v_api_key_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'API key created',
        'api_key_id', v_api_key_id,
        'key_value', p_key_value
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: update_department_budget
CREATE OR REPLACE FUNCTION public.update_department_budget(
    p_department_id UUID,
    p_new_budget NUMERIC
)
RETURNS JSON AS $$
BEGIN
    IF p_new_budget < 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Budget cannot be negative'
        );
    END IF;
    
    UPDATE public.departments
    SET budget = p_new_budget
    WHERE id = p_department_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Department budget updated',
        'department_id', p_department_id,
        'new_budget', p_new_budget
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: get_department_members
CREATE OR REPLACE FUNCTION public.get_department_members(
    p_department_id UUID
)
RETURNS TABLE (
    member_id UUID,
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    role TEXT,
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dm.id,
        dm.user_id,
        u.email,
        u.name,
        dm.role,
        dm.joined_at
    FROM public.department_members dm
    JOIN public.users u ON dm.user_id = u.id
    WHERE dm.department_id = p_department_id
    ORDER BY dm.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: get_department_budget_summary
CREATE OR REPLACE FUNCTION public.get_department_budget_summary(
    p_company_id UUID
)
RETURNS TABLE (
    department_id UUID,
    department_name TEXT,
    budget NUMERIC,
    spent NUMERIC,
    remaining NUMERIC,
    utilization_percent NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.name,
        d.budget,
        d.spent,
        d.budget - d.spent,
        CASE 
            WHEN d.budget = 0 THEN 0
            ELSE ROUND((d.spent / d.budget) * 100, 2)
        END
    FROM public.departments d
    WHERE d.company_id = p_company_id
    ORDER BY d.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

