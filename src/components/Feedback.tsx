"use client";

import { Button, Dialog, DialogPanel, Metric, Textarea } from "@tremor/react";
import { useState } from "react";
import { submitFeedback } from "../app/actions";

const initialState = {
  submitting: false,
  open: false,
  value: ""
};

export function Feedback() {
  const [feedbackState, setFeedbackState] = useState(initialState);

  const resetFeedbackState = () => {
    setFeedbackState({
      ...feedbackState,
      submitting: true,
      value: "Submitted! Thank you for your feedback!"
    });
  };

  return (
    <>
      <div className="absolute top-0 right-0 m-6">
        <Button variant="secondary" data-tally-open="meL0Xq" data-tally-emoji-text="👋" data-tally-emoji-animation="wave">
          Give Feedback
        </Button>

        {/** Disable Supabase feedback button */}
        {/* <Button
          variant="secondary"
          onClick={() => setFeedbackState({ ...feedbackState, open: true })}
        >
          Give Feedback
        </Button> */}
      </div>

      <Dialog
        open={feedbackState.open}
        onClose={val => setFeedbackState({ ...feedbackState, open: val })}
        static={true}
      >
        <DialogPanel>
          <Metric className="text-left">
            <b>Feedback</b>
            </Metric>
          <form
            onSubmit={async e => {
              e.preventDefault();

              setFeedbackState({
                ...feedbackState,
                submitting: true
              });
              const formData = new FormData(e.currentTarget);
              await submitFeedback(formData);

              resetFeedbackState();
            }}
          >
            <Textarea
              className="mt-4 min-h-24 w-full"
              onChange={e =>
                setFeedbackState({
                  ...feedbackState,
                  value: e.target.value
                })
              }
              name="feedback"
              id="feedback"
              placeholder="Start typing here..."
              rows={6}
              value={feedbackState.value}
            />
            <Button
              type="submit"
              className="mt-4 float-right"
              disabled={
                feedbackState.value.length < 5 || feedbackState.submitting
              }
            >
              Submit
            </Button>
            <Button
              type="reset"
              className="mt-4 float-right mr-2"
              variant="secondary"
              onClick={() =>
                setFeedbackState({ ...feedbackState, open: false })
              }
            >
              {feedbackState.submitting ? "Close" : "Cancel"}
            </Button>
          </form>
        </DialogPanel>
      </Dialog>
    </>
  );
}
