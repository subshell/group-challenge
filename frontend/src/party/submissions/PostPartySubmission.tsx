import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUpload } from 'react-icons/fa';
import { useMutation } from 'react-query';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { addSubmission, useParty } from '../../api';
import { PartySubmissionFormData } from '../../api-models';
import { useSession } from '../../user/session';

function PostPartySubmission() {
  const [session] = useSession();
  const { id } = useParams<{ id: string }>();
  const [imgPrevSrc, setImgPrevSrc] = useState<string | undefined>();
  const party = useParty(id);
  const form = useForm<PartySubmissionFormData>();
  const { mutateAsync } = useMutation(addSubmission);

  const hasFile = () => {
    return form.getValues('files')?.length > 0;
  };

  useEffect(() => {
    if (!hasFile()) return;

    const file = form.getValues('files')[0];
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>) {
      setImgPrevSrc(e.target!.result as string);
    };
    reader.readAsDataURL(file);
  }, [imgPrevSrc, setImgPrevSrc, form]);

  const onSubmit = async (data: PartySubmissionFormData) => {
    const sumbission = await mutateAsync({ partyId: id, submission: data, sessionToken: session!.token });
    form.reset();
    toast('Your submission has been added!');
  };

  if (party.isError) return <p>Error</p>;
  if (party.isLoading || party.isIdle) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl">Submit a new entry to {party.data.name}</h1>

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
              <input
                name="files"
                ref={form.register({ required: true })}
                type="file"
                accept="image/*"
                className="hidden"
              />
            </label>
            <div className="w-96 p-6 rounded-lg" hidden={!hasFile()}>
              <img className="rounded w-full mb-6" src={imgPrevSrc} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
            ref={form.register()}
            type="text"
            id="name"
            name="name"
          />
        </div>

        <div>
          <label className="block text-grey-darker text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>

          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-grey-darker"
            ref={form.register()}
            id="description"
            name="description"
          />
        </div>

        <input
          className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded"
          value="Submit"
          disabled={form.formState.isSubmitting}
          type="submit"
        />
      </form>
    </div>
  );
}

export default PostPartySubmission;
