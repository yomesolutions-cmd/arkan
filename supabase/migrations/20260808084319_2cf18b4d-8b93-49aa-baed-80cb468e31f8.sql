DROP POLICY "Active questions are public" ON public.question_nodes;

CREATE POLICY "Anon reads active questions" ON public.question_nodes
FOR SELECT TO anon USING (is_active);

CREATE POLICY "Users read questions" ON public.question_nodes
FOR SELECT TO authenticated USING (is_active OR public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;