
-- Create storage bucket for prescription uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', false);

-- Allow authenticated users to upload prescriptions
CREATE POLICY "Users can upload prescriptions"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to read their own prescriptions
CREATE POLICY "Users can read own prescriptions"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);
