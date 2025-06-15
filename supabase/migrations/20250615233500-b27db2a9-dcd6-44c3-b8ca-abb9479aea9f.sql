
-- Update the handle_new_user function to properly reference the user_role enum
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    email,
    phone_number,
    brokerage,
    role
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'brokerage',
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'agent'::public.user_role)
  );
  RETURN new;
END;
$$;
