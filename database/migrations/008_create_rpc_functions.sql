-- RPC Function: invite_team_member
CREATE OR REPLACE FUNCTION public.invite_team_member(
    p_company_id UUID,
    p_email TEXT,
    p_role TEXT
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_result JSON;
BEGIN
    -- Check if user exists
    SELECT id INTO v_user_id FROM public.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        -- Create new user with pending status
        INSERT INTO public.users (email, company_id, role, status)
        VALUES (p_email, p_company_id, p_role, 'pending')
        RETURNING id INTO v_user_id;
        
        v_result := json_build_object(
            'success', true,
            'message', 'Invitation sent to ' || p_email,
            'user_id', v_user_id,
            'status', 'pending'
        );
    ELSE
        -- Update existing user's role
        UPDATE public.users 
        SET role = p_role, company_id = p_company_id
        WHERE id = v_user_id;
        
        v_result := json_build_object(
            'success', true,
            'message', 'User ' || p_email || ' added to company',
            'user_id', v_user_id,
            'status', 'active'
        );
    END IF;
    
    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: update_team_member_role
CREATE OR REPLACE FUNCTION public.update_team_member_role(
    p_user_id UUID,
    p_new_role TEXT
)
RETURNS JSON AS $$
BEGIN
    UPDATE public.users 
    SET role = p_new_role
    WHERE id = p_user_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'User role updated to ' || p_new_role,
        'user_id', p_user_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: create_department
CREATE OR REPLACE FUNCTION public.create_department(
    p_company_id UUID,
    p_name TEXT,
    p_description TEXT,
    p_budget NUMERIC,
    p_manager_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_department_id UUID;
BEGIN
    INSERT INTO public.departments (company_id, name, description, budget, manager_id)
    VALUES (p_company_id, p_name, p_description, p_budget, p_manager_id)
    RETURNING id INTO v_department_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Department ' || p_name || ' created',
        'department_id', v_department_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: assign_user_to_department
CREATE OR REPLACE FUNCTION public.assign_user_to_department(
    p_user_id UUID,
    p_department_id UUID,
    p_role TEXT DEFAULT 'member'
)
RETURNS JSON AS $$
DECLARE
    v_member_id UUID;
BEGIN
    INSERT INTO public.department_members (department_id, user_id, role)
    VALUES (p_department_id, p_user_id, p_role)
    ON CONFLICT (department_id, user_id) DO UPDATE
    SET role = p_role
    RETURNING id INTO v_member_id;
    
    -- Update member count
    UPDATE public.departments
    SET member_count = (
        SELECT COUNT(*) FROM public.department_members 
        WHERE department_id = p_department_id
    )
    WHERE id = p_department_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'User assigned to department',
        'member_id', v_member_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

