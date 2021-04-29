import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUpload } from 'react-icons/fa';
import { useMutation } from 'react-query';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { addSubmission } from '../../api';
import { PartyResponse, PartySubmissionFormData } from '../../api-models';
import { useSession } from '../../user/session';

function PostPartySubmission({ party, afterUpload }: { party: PartyResponse; afterUpload?: () => any }) {
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();
  const [imgPrevSrc, setImgPrevSrc] = useState<string | undefined>();
  const form = useForm<PartySubmissionFormData>();
  const { mutateAsync } = useMutation(addSubmission);

  const files = form.watch('files');
  const hasFile = () => !!imgPrevSrc;

  useEffect(() => {
    if (!files || (files && files.length === 0)) {
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      setImgPrevSrc(e.target!.result as string);
    };
    reader.readAsDataURL(file);
  }, [setImgPrevSrc, files]);

  const onSubmit = async (data: PartySubmissionFormData) => {
    try {
      await mutateAsync({ partyId: id, submission: data, sessionToken: session!.token });
    } catch {
      toast.error('Submission failed, is the party over or live?');
      return;
    }
    setImgPrevSrc(undefined);
    form.reset();
    toast('Your submission has been added!');
    afterUpload?.();
  };

  return (
    <div>
      <h1 className="text-2xl mb-8">Submit a new entry to {party.name}</h1>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <div className="flex items-center justify-center bg-grey-lighter">
            <label
              className={`w-64 flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border cursor-pointer hover:bg-blue-500 hover:text-white ${
                hasFile() ? 'hidden' : 'flex'
              }`}
            >
              <FaUpload size={26} />
              <span className="mt-2 text-base leading-normal">Select a file</span>
              <input className="hidden" type="file" accept="image/*" {...form.register('files', { required: true })} />
            </label>
            <div className="w-96 p-6 rounded-lg" hidden={!hasFile()}>
              <img className="rounded w-full mb-6" src={imgPrevSrc} alt="preview" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="name">
            Image Title <span className="text-gray-600">(optional)</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
            type="text"
            {...form.register('name')}
          />
        </div>

        <div>
          <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="description">
            Image Description (optional)
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
            {...form.register('description')}
          />
        </div>

        <input
          className="bg-blue-500 hover:opacity-75 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          value="Submit"
          disabled={form.formState.isSubmitting || !imgPrevSrc}
          type="submit"
        />
      </form>
    </div>
  );
}

export default PostPartySubmission;
