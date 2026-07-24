import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { secretaryAppointmentsApi } from "../../api/secretaryAppointments";

interface Appointment {
  id: number;
  patient: {
    first_name: string;
    last_name: string;
  };
  availability: {
    date: string;
    start_time: string;
  };
  status: string;
  reason?: string;
}


export default function SecretaryAppointments() {

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");


  useEffect(() => {
    loadAppointments();
  }, []);


  const loadAppointments = () => {

    secretaryAppointmentsApi
      .get()
      .then(res => {
        setAppointments(res.data);
      })
      .catch(console.error);

  };


  const confirmAppointment = async(id:number)=>{

    await secretaryAppointmentsApi.confirm(id);

    loadAppointments();

  };


  const cancelAppointment = async(id:number)=>{

    await secretaryAppointmentsApi.cancel(id);

    loadAppointments();

  };



  const filteredAppointments = appointments.filter((rdv)=>{

    const name =
      rdv.patient.first_name +
      " " +
      rdv.patient.last_name;


    const matchesSearch =
      name.toLowerCase()
      .includes(search.toLowerCase());


    const matchesFilter =
      filter==="all"
      ||
      rdv.status===filter;


    return matchesSearch && matchesFilter;

  });



  return (

    <DashboardLayout>


      <div className="secretary-page">


        {/* HEADER */}

        <div className="secretary-header">

          <div>
            <h1>
              Gestion des rendez-vous
            </h1>

            <p>
              Créer, modifier, confirmer ou annuler les rendez-vous
            </p>
          </div>


          <button className="primary-btn">
            ＋ Nouveau RDV
          </button>

        </div>



        {/* SEARCH + FILTER */}

        <div className="appointment-toolbar">


          <input
            placeholder="Rechercher patient, médecin..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />


          <div className="filters">

            {
              [
                ["all","Tous"],
                ["confirmed","Confirmé"],
                ["pending","En attente"],
                ["cancelled","Annulé"]
              ]
              .map(([key,label])=>(

                <button
                  key={key}
                  className={
                    filter===key
                    ?
                    "active-filter"
                    :
                    ""
                  }
                  onClick={()=>setFilter(key)}
                >
                  {label}
                </button>

              ))
            }


          </div>


        </div>




        {/* TABLE */}


        <div className="appointment-table">


          <div className="table-head">

            <span>ID</span>
            <span>PATIENT</span>
            <span>DATE</span>
            <span>HEURE</span>
            <span>STATUT</span>
            <span>ACTIONS</span>

          </div>




          {
            filteredAppointments.map((rdv)=>(


              <div
                className="table-row"
                key={rdv.id}
              >


                <span>
                  RDV-{rdv.id}
                </span>


                <span className="patient-name">

                  <div className="avatar">
                    {
                      rdv.patient.first_name[0]
                    }
                  </div>

                  {
                    rdv.patient.first_name
                  }
                  <br/>
                  {
                    rdv.patient.last_name
                  }

                </span>


                <span>
                  {
                    rdv.availability.date
                  }
                </span>


                <span>
                  {
                    rdv.availability.start_time.slice(0,5)
                  }
                </span>



                <span>

                  <span
                    className={
                      `status ${
                        rdv.status
                      }`
                    }
                  >

                    {
                      rdv.status==="confirmed"
                      ?
                      "✓ Confirmé"
                      :
                      rdv.status==="pending"
                      ?
                      "◉ En attente"
                      :
                      "× Annulé"
                    }

                  </span>

                </span>




                <span className="actions">


                  {
                    rdv.status==="pending" &&
                    <button
                      onClick={()=>confirmAppointment(rdv.id)}
                    >
                      ✓
                    </button>
                  }


                  <button>
                    ✎
                  </button>


                  <button
                    onClick={()=>cancelAppointment(rdv.id)}
                  >
                    ×
                  </button>


                </span>



              </div>


            ))
          }



        </div>


      </div>


    </DashboardLayout>

  );

}