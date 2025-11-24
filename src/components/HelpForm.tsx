import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from 'react-day-picker';

export const HelpForm = () => {
  const [helpData, setName] = useState("");

  function handleChange(e) {
    setName(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert(name);
  }


  const handleHelpSubmit = async (e) => {
        e.preventDefault();
       const endpointUrl = "/submit"

   // setIsSubmitting(true);
    console.log("Submitting to endpoint:", endpointUrl);

    try {
    //  const exportData = prepareExportData();

      var url = new URL(window.location);
      var idOne = url.searchParams.get("id_one");
      
      const response = await fetch(endpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_one: idOne,
          helpMessage: helpData,
          timestamp: new Date().toISOString(),
       //   total_conversations: exportData.length,
        //  total_messages: exportData.reduce((sum, chat) => sum + chat.messages.length, 0)
        }),
      });

      if (response.ok) {
        console.log("Help data submitted.");
      } else {
        console.error(`Server responded with ${response.status}`);
        
      }
        window.location.href="https://app.prolific.com/submissions/complete?cc=C673RJ8A";       
        alert("Please continue at: https://app.prolific.com/submissions/complete?cc=C673RJ8A");
    } catch (error) {
      console.error("Error submitting data:", error);    
      window.location.href="https://app.prolific.com/submissions/complete?cc=C673RJ8A";       
      alert("Please continue at: https://app.prolific.com/submissions/complete?cc=C673RJ8A"); 
    } 
  };

  return (
     <Card className="p-6">
        <CardContent style={{backgroundColor:"lightblue"}}>
      <h3 className="text-lg font-semibold text-foreground">Help and Support</h3>
      <p className="mb-4 text-sm">
      If you face a problem and cannot continue with this ChatGPT Chat Submission Tool, then please continue here. In the following you will be able to state your issue and we will help you to submit your ChatGPT data:
              </p>   
             <form onSubmit={handleHelpSubmit}>
      <label>Please describe your issue:
        <textarea
        //  type="text" 
          value={helpData}
          onChange={handleChange}
        />
      </label>
      <input type="submit" value="Submit and Continue"/>
    </form>
    </CardContent>   
    </Card>
  )
}
