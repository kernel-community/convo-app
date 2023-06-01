import TextField from "../RsvpConfirmationForm/TextField";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../Button";
import Signature from "../Signature";
import isNicknameSet from "src/utils/isNicknameSet";
import FieldLabel from "./FieldLabel";
import ModalContainer from "./ModalContainer";
import useSubmitRsvp from "src/hooks/useSubmitRsvp";
import { useRsvpIntention } from "src/context/RsvpIntentionContext";
import type { RsvpInput } from "../EventWrapper";
import { rsvpInputSchema } from "../EventWrapper";
import type { UserStatus } from "src/context/UserContext";

const ModalToConfirmRsvp = ({
  title,
  user,
  hideEmailRequest = true,
}: {
  title: string;
  user?: UserStatus;
  hideEmailRequest: boolean;
}) => {
  const { submit } = useSubmitRsvp();
  const { rsvpIntention, setRsvpIntention } = useRsvpIntention();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RsvpInput>({
    resolver: zodResolver(rsvpInputSchema),
  });
  const onSubmit: SubmitHandler<RsvpInput> = () => submit();
  return (
    <ModalContainer>
      <div className="mt-4">
        <div>
          Before confirming your spot in{" "}
          <span className="font-bold">{title}</span>
        </div>
        <div className="pt-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="align-center flex flex-col gap-6"
          >
            {!hideEmailRequest && (
              <div>
                <FieldLabel>
                  Would you like to receive a google Calendar invite?
                </FieldLabel>
                <TextField
                  hideLabel
                  name="email"
                  fieldName="Email"
                  register={register}
                  errors={errors}
                  required={false}
                  onChange={(e) => {
                    setRsvpIntention({
                      ...rsvpIntention,
                      email: e.target.value,
                    });
                  }}
                />
              </div>
            )}

            {/* nickname */}
            {user && isNicknameSet(user.nickname) ? (
              <div>
                <FieldLabel>Signing as</FieldLabel>
                <Signature sign={user.nickname} style="handwritten" />
              </div>
            ) : (
              <div>
                <FieldLabel>nickname</FieldLabel>
                <TextField
                  hideLabel
                  name="nickname"
                  fieldName="Nickname"
                  register={register}
                  errors={errors}
                  required={false}
                  onChange={(e) => {
                    setRsvpIntention({
                      ...rsvpIntention,
                      nickname: e.target.value,
                    });
                  }}
                />
              </div>
            )}
            <Button buttonText="Submit" type="submit" />
          </form>
        </div>
      </div>
    </ModalContainer>
  );
};

export default ModalToConfirmRsvp;
