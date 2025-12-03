import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from 'react-day-picker';
import { getProlificReturnCode } from '@/vars';

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

    var url = new URL(window.location.href);
    var idOne = url.searchParams.get("id_one");

    const questionnaireAnswered = url.searchParams.get("q")=="f";

    const targetUrl = questionnaireAnswered ?
       "https://app.prolific.com/submissions/complete?cc="+getProlificReturnCode() :
        "https://sosci.sowi.uni-mannheim.de/aiinnews/?returncall=1&id_two="+idOne+"&id_three=hu"

    try {
    //  const exportData = prepareExportData();

      
     
      
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






        window.location.href=targetUrl;       
        alert("Please continue at: "+targetUrl);
    } catch (error) {
      console.error("Error submitting data:", error);    
      window.location.href=targetUrl;       
      alert("Please continue at: "+targetUrl); 
    } 
  };

  return (
     <Card className="p-6">
        <CardContent style={{backgroundColor:"lightblue"}}>
      <h3 className="text-lg font-semibold text-foreground">Help and Support</h3>
      <p className="mb-4 text-sm">
      If you face a problem and cannot continue with this ChatGPT Chat Submission Tool, then please continue here. In the following you will be able to state your issue and we will help you to submit your ChatGPT data:
              </p>   
              <p><b>If you still did not receive your ChatGPT export data: Please briefly state it below, save this page's url   <a href="{window.location.href}">{window.location.href}</a>  , submit the form, and come back to this page as soon as you receive it. Thank you for your contribution!</b></p>
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
