import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUpload } from 'react-icons/fa';
import { useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { addSubmission, useConfig } from '../../api/api';
import { PartyResponse, PartySubmissionFormData } from '../../api/api-models';
import { useSession } from '../../user/session';

function PostPartySubmission({ party, afterUpload }: { party: PartyResponse; afterUpload?: () => any }) {
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();
  const [imgPrevSrc, setImgPrevSrc] = useState<string | undefined>();
  const form = useForm<PartySubmissionFormData>();
  const { mutateAsync } = useMutation(addSubmission);
  const { data: appConfig } = useConfig();

  const file = form.watch('files')?.[0];
  const hasPreview = () => !!imgPrevSrc;

  useEffect(() => {
    if (!file || !appConfig) {
      return;
    }

    if (file?.size > appConfig?.fileSize) {
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      setImgPrevSrc(e.target!.result as string);
    };
    reader.readAsDataURL(file);
  }, [file, appConfig]);

  if (!id) {
    return <div>No party id provided</div>;
  }

  const fileTooLarge = appConfig?.fileSize && file?.size > appConfig?.fileSize;

  const onSubmit = async (data: PartySubmissionFormData) => {
    const req = await mutateAsync({ partyId: id, submission: data, sessionToken: session!.token });
    if (req.status === 413) {
      toast.error('Submission failed: image size too large!');
      return;
    }

    if (req.status >= 400 && req.status <= 599) {
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
              className={`w-64 flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border cursor-pointer hover:bg-blue-500 hover:text-white ${
                hasPreview() ? 'hidden' : 'flex'
              } dark:bg-slate-900 dark:hover:bg-blue-500`}
            >
              <FaUpload size={26} />
              <span className="mt-2 text-base leading-normal uppercase">Select a file</span>
              <span className="font-light">max {(appConfig?.fileSize ?? 0) >> 20}MB</span>
              <input
                className="hidden"
                type="file"
                accept="image/*"
                {...form.register('files', { required: true, validate: () => !fileTooLarge })}
              />
              {fileTooLarge && <span className="font-bold">File too large!</span>}
            </label>
            <div className="w-96 p-6 rounded-lg" hidden={!hasPreview()}>
              <img className="rounded w-full mb-6" src={imgPrevSrc} alt="preview" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="name">
            Image Title <span className="text-gray-500">(optional)</span>
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-black"
            type="text"
            {...form.register('name')}
          />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2" htmlFor="description">
            Image Description <span className="text-gray-500">(optional)</span>
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-black"
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
